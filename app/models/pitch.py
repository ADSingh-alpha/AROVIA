# app/models/pitch.py
"""Pitch entity model representing startup pitch deck submissions and live pitch status."""

import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class PitchStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    LIVE = "LIVE"
    FUNDED = "FUNDED"
    REJECTED = "REJECTED"


class Pitch(Base):
    __tablename__ = "pitches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    startup_id = Column(String(36), ForeignKey("startups.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    deck_file_url = Column(String(1024), nullable=True)
    video_url = Column(String(1024), nullable=True)
    ask_amount = Column(Numeric(15, 2), nullable=False)
    equity_percentage = Column(Numeric(5, 2), nullable=False)
    valuation = Column(Numeric(15, 2), nullable=True)
    status = Column(String(50), nullable=False, default=PitchStatus.PENDING.value, index=True)
    live_room_id = Column(String(100), nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    startup = relationship("Startup", back_populates="pitches")
    funding_terms = relationship("FundingTerm", back_populates="pitch", cascade="all, delete-orphan")
    commitments = relationship("InvestmentCommitment", back_populates="pitch", cascade="all, delete-orphan")
    live_rooms = relationship("LiveRoomSession", back_populates="pitch", cascade="all, delete-orphan")

    def compute_valuation(self):
        if self.equity_percentage and float(self.equity_percentage) > 0:
            self.valuation = round(float(self.ask_amount) / (float(self.equity_percentage) / 100.0), 2)
        else:
            self.valuation = 0.00
