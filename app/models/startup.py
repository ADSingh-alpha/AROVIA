# app/models/startup.py
"""Startup entity model for ventures pitching on AROVIA."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Numeric, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Startup(Base):
    __tablename__ = "startups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    founder_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    tagline = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=False, index=True)
    stage = Column(String(50), nullable=False, default="Seed")
    website = Column(String(255), nullable=True)
    valuation_target = Column(Numeric(15, 2), nullable=False, default=0.00)
    funding_goal = Column(Numeric(15, 2), nullable=False, default=0.00)
    equity_offered_percent = Column(Numeric(5, 2), nullable=False, default=0.00)
    total_shares = Column(BigInteger, nullable=False, default=10000000)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    founder = relationship("User", back_populates="startups")
    pitches = relationship("Pitch", back_populates="startup", cascade="all, delete-orphan")
    cap_table_entries = relationship("CapTableLedger", back_populates="startup", cascade="all, delete-orphan")
    commitments = relationship("InvestmentCommitment", back_populates="startup", cascade="all, delete-orphan")
