# app/core/kafka_producer.py
"""Apache Kafka Producer client with resilient async publishing and fallback buffer."""

import json
import logging
from typing import Optional, Dict, Any, List
from aiokafka import AIOKafkaProducer
from app.config import settings

logger = logging.getLogger(__name__)


class KafkaProducerService:
    def __init__(self):
        self._producer: Optional[AIOKafkaProducer] = None
        self._is_connected: bool = False
        self._fallback_event_store: List[Dict[str, Any]] = []

    async def start(self):
        """Initialize connection to the Kafka cluster."""
        try:
            bootstrap_servers = [s.strip() for s in settings.KAFKA_BOOTSTRAP_SERVERS.split(",")]
            self._producer = AIOKafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                key_serializer=lambda k: k.encode("utf-8") if k else None,
                request_timeout_ms=5000,
            )
            await self._producer.start()
            self._is_connected = True
            logger.info("Connected to Kafka cluster at %s", settings.KAFKA_BOOTSTRAP_SERVERS)
        except Exception as e:
            self._is_connected = False
            logger.warning("Kafka cluster unavailable (%s). Running in resilient buffer mode.", str(e))

    async def stop(self):
        """Close Kafka producer connection."""
        if self._producer and self._is_connected:
            try:
                await self._producer.stop()
                logger.info("Kafka producer stopped cleanly.")
            except Exception as e:
                logger.error("Error stopping Kafka producer: %s", str(e))
        self._is_connected = False

    async def send_event(self, topic: str, value: Dict[str, Any], key: Optional[str] = None) -> bool:
        """
        Publish an event message to a Kafka topic.
        If Kafka is disconnected, logs and appends to local fallback store for delivery assurance.
        """
        if self._is_connected and self._producer:
            try:
                await self._producer.send_and_wait(topic=topic, value=value, key=key)
                logger.info("Published event to Kafka topic '%s' (key=%s)", topic, key)
                return True
            except Exception as e:
                logger.error("Failed to send Kafka event to topic '%s': %s", topic, str(e))

        # Fallback buffer
        record = {
            "topic": topic,
            "key": key,
            "value": value
        }
        self._fallback_event_store.append(record)
        logger.info("[BUFFERED EVENT] Topic: '%s', Key: '%s', Value: %s", topic, key, value)
        return False

    def is_healthy(self) -> bool:
        """Check if Kafka connection is active."""
        return self._is_connected

    def get_buffered_events(self) -> List[Dict[str, Any]]:
        """Retrieve events stored in memory buffer."""
        return list(self._fallback_event_store)


kafka_producer = KafkaProducerService()
