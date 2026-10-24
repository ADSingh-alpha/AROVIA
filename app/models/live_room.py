# app/models/live_room.py
"""Live Room and WebRTC session management with real-time Q&A audit trail."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class LiveRoomSession(Base):
    __tablename__ = "live_room_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    room_id = Column(String(100), unique=True, nullable=False, index=True)
    pitch_id = Column(String(36), ForeignKey("pitches.id", ondelete="CASCADE"), nullable=True, index=True)
    host_founder_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    pitch = relationship("Pitch", back_populates="live_rooms")
    host_founder = relationship("User", back_populates="hosted_rooms")


class LiveQALog(Base):
    __tablename__ = "live_qa_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    room_id = Column(String(100), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    author_name = Column(String(255), nullable=False)
    user_role = Column(String(50), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    answered_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
