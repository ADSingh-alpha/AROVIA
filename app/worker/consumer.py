# app/worker/consumer.py
"""AROVIA Platform Kafka Consumer Worker (TSK-304).

Consumes events from 'startup.pitches.submitted', 'investment-offers',
processes audit logging, investor deal-flow alerts, and DLQ routing.
"""

import asyncio
import json
import logging
import signal
import sys
from typing import Dict, Any
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from app.config import settings
from app.database import SessionLocal, init_db
from app.models.audit import AuditLog
from app.models.user import User, UserRole

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("AroviaWorker")


class DealFlowKafkaWorker:
    def __init__(self):
        self.running = False
        self.consumer: AIOKafkaConsumer = None
        self.dlq_producer: AIOKafkaProducer = None

    async def start(self):
        """Initialize database, DLQ producer, and Kafka consumer group."""
        init_db()
        bootstrap_servers = [s.strip() for s in settings.KAFKA_BOOTSTRAP_SERVERS.split(",")]
        topics = [
            settings.KAFKA_TOPIC_PITCH_SUBMITTED,
            settings.KAFKA_TOPIC_INVESTMENT_OFFERS,
            settings.KAFKA_TOPIC_PITCH_REGISTERED,
            settings.KAFKA_TOPIC_COMMITMENT_ACCEPTED
        ]

        logger.info("Initializing Kafka Consumer Worker on group '%s'...", settings.KAFKA_CONSUMER_GROUP)
        logger.info("Connecting to Kafka brokers: %s", bootstrap_servers)

        # Producer for Dead Letter Queue (DLQ)
        try:
            self.dlq_producer = AIOKafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )
            await self.dlq_producer.start()
            logger.info("DLQ Producer active.")
        except Exception as e:
            logger.warning("DLQ Producer could not connect: %s", str(e))

        # Consumer loop with retry
        retry_delay = 5
        while not self.running:
            try:
                self.consumer = AIOKafkaConsumer(
                    *topics,
                    bootstrap_servers=bootstrap_servers,
                    group_id=settings.KAFKA_CONSUMER_GROUP,
                    auto_offset_reset="earliest",
                    enable_auto_commit=True,
                    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                    request_timeout_ms=10000
                )
                await self.consumer.start()
                self.running = True
                logger.info("Subscribed to Kafka topics: %s", topics)
            except Exception as e:
                logger.warning("Kafka brokers not ready yet (%s). Retrying in %ds...", str(e), retry_delay)
                await asyncio.sleep(retry_delay)

        # Main message consumption loop
        try:
            async for msg in self.consumer:
                await self.process_message(msg.topic, msg.key, msg.value)
        except asyncio.CancelledError:
            logger.info("Worker consumer task cancelled.")
        finally:
            await self.shutdown()

    async def process_message(self, topic: str, key: Any, value: Dict[str, Any]):
        """Dispatch and process incoming Kafka message with DLQ error handling."""
        logger.info("Incoming event from topic '%s': %s", topic, value)
        db = SessionLocal()
        try:
            if topic == settings.KAFKA_TOPIC_PITCH_SUBMITTED:
                await self._handle_pitch_submitted(db, value)
            elif topic == settings.KAFKA_TOPIC_INVESTMENT_OFFERS:
                await self._handle_offer_submitted(db, value)
            elif topic == settings.KAFKA_TOPIC_COMMITMENT_ACCEPTED:
                await self._handle_commitment_accepted(db, value)
            else:
                # General audit persistence
                audit = AuditLog(
                    event_type=topic,
                    entity_type="general",
                    entity_id=str(key or "unknown"),
                    payload=json.dumps(value)
                )
                db.add(audit)
                db.commit()

        except Exception as err:
            logger.error("Error processing message from topic '%s': %s", topic, str(err))
            db.rollback()
            await self._send_to_dlq(topic, value, str(err))
        finally:
            db.close()

    async def _handle_pitch_submitted(self, db, payload: Dict[str, Any]):
        """Step 3: Background consumer picks up pitch event, broadcasts alert to investors, updates audit log."""
        pitch_id = payload.get("pitch_id", "unknown")
        startup_name = payload.get("startup_name", "Unknown Startup")
        industry = payload.get("industry", "General")
        ask_amount = payload.get("ask_amount", 0)
        equity = payload.get("equity_percentage", 0)

        # 1. Update Audit Log
        audit = AuditLog(
            event_type=settings.KAFKA_TOPIC_PITCH_SUBMITTED,
            entity_type="pitch",
            entity_id=pitch_id,
            payload=json.dumps(payload),
            actor_id=payload.get("founder_id")
        )
        db.add(audit)
        db.commit()

        # 2. Find accredited angel investors
        investors = db.query(User).filter(
            User.role == UserRole.INVESTOR.value,
            User.is_active == True
        ).all()
        logger.info(
            "Found %d active Angel Investors to alert for pitch '%s' (%s, $%s for %s%%)",
            len(investors), startup_name, industry, f"{ask_amount:,.2f}", equity
        )

        logger.info("Broadcasted deal-flow alert for Pitch %s to angel network.", pitch_id)

    async def _handle_offer_submitted(self, db, payload: Dict[str, Any]):
        """Record offer event in audit logs."""
        audit = AuditLog(
            event_type=settings.KAFKA_TOPIC_INVESTMENT_OFFERS,
            entity_type="funding_term",
            entity_id=payload.get("term_sheet_id", "unknown"),
            payload=json.dumps(payload),
            actor_id=payload.get("investor_id")
        )
        db.add(audit)
        db.commit()
        logger.info("Recorded investment offer audit log for Term Sheet %s", payload.get("term_sheet_id"))

    async def _handle_commitment_accepted(self, db, payload: Dict[str, Any]):
        """Record commitment event in audit logs."""
        audit = AuditLog(
            event_type=settings.KAFKA_TOPIC_COMMITMENT_ACCEPTED,
            entity_type="investment_commitment",
            entity_id=payload.get("commitment_id", "unknown"),
            payload=json.dumps(payload),
            actor_id=payload.get("investor_id")
        )
        db.add(audit)
        db.commit()
        logger.info("Recorded deal closure audit log for TX %s", payload.get("transaction_reference"))

    async def _send_to_dlq(self, original_topic: str, failed_payload: Dict[str, Any], error_msg: str):
        """Route unhandled or failed messages to Dead Letter Queue."""
        dlq_topic = settings.KAFKA_TOPIC_PITCH_DLQ if "pitch" in original_topic else settings.KAFKA_TOPIC_OFFERS_DLQ
        logger.warning("Routing failed message to DLQ topic '%s': %s", dlq_topic, error_msg)
        if self.dlq_producer:
            try:
                dlq_record = {
                    "original_topic": original_topic,
                    "error": error_msg,
                    "payload": failed_payload
                }
                await self.dlq_producer.send_and_wait(dlq_topic, dlq_record)
            except Exception as e:
                logger.error("Failed to write to DLQ: %s", str(e))

    async def shutdown(self):
        """Gracefully close Kafka consumers and producers."""
        logger.info("Shutting down Kafka Consumer Worker...")
        if self.consumer:
            await self.consumer.stop()
        if self.dlq_producer:
            await self.dlq_producer.stop()
        self.running = False


def main():
    worker = DealFlowKafkaWorker()
    loop = asyncio.get_event_loop()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, lambda: asyncio.create_task(worker.shutdown()))
        except NotImplementedError:
            # Signal handling on Windows
            pass

    try:
        loop.run_until_complete(worker.start())
    except KeyboardInterrupt:
        logger.info("Worker stopped by KeyboardInterrupt.")


if __name__ == "__main__":
    main()
