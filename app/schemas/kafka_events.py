# app/schemas/kafka_events.py
"""Event payload schemas for Apache Kafka event-driven pipelines."""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class PitchSubmittedEvent(BaseModel):
    """Published to Kafka topic: startup.pitches.submitted (Roadmap Step 2)"""
    event_id: str
    event_type: str = "startup.pitches.submitted"
    pitch_id: str
    startup_id: str
    startup_name: str
    founder_id: str
    title: str
    ask_amount: float
    equity_percentage: float
    valuation: float
    industry: str
    deck_file_url: Optional[str] = None
    status: str = "PENDING"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PitchRegisteredEvent(BaseModel):
    """Published to Kafka topic: pitch.registered or pitch-events"""
    event_id: str
    event_type: str = "pitch.registered"
    pitch_id: str
    startup_id: str
    title: str
    deck_url: Optional[str] = None
    status: str = "PENDING"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class OfferSubmittedEvent(BaseModel):
    """Published to Kafka topic: investment-offers"""
    event_id: str
    event_type: str = "investment-offers"
    term_sheet_id: str
    pitch_id: str
    investor_id: str
    investor_name: str
    offered_amount: float
    equity_percent: float
    implied_valuation: float
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CommitmentAcceptedEvent(BaseModel):
    """Published to Kafka topic: commitment.accepted"""
    event_id: str
    event_type: str = "commitment.accepted"
    commitment_id: str
    pitch_id: str
    startup_id: str
    investor_id: str
    amount: float
    equity_percent: float
    transaction_reference: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class KafkaDLQEvent(BaseModel):
    """Dead-Letter Queue message payload when processing fails"""
    original_topic: str
    error_message: str
    failed_payload: Dict[str, Any]
    retry_count: int
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
