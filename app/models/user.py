# app/models/user.py
"""User database model supporting Role-Based Access Control (RBAC)."""

import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class UserRole(str, enum.Enum):
    FOUNDER = "founder"
    INVESTOR = "investor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default=UserRole.FOUNDER.value, index=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(512), nullable=True)
    organization = Column(String(255), nullable=True)
    accredited_investor = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    startups = relationship("Startup", back_populates="founder", cascade="all, delete-orphan")
    funding_terms = relationship("FundingTerm", back_populates="investor", cascade="all, delete-orphan")
    commitments = relationship("InvestmentCommitment", back_populates="investor", cascade="all, delete-orphan")
    hosted_rooms = relationship("LiveRoomSession", back_populates="host_founder", cascade="all, delete-orphan")
