# app/schemas/live_room.py
"""Pydantic schemas for WebRTC signaling and Live Room Q&A."""

from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, Field


class LiveRoomCreate(BaseModel):
    pitch_id: str
    room_id: Optional[str] = None


class LiveRoomResponse(BaseModel):
    id: str
    room_id: str
    pitch_id: Optional[str] = None
    host_founder_id: str
    is_active: bool
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QACreate(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)


class QAAnswer(BaseModel):
    answer: str = Field(..., min_length=1, max_length=2000)


class QAResponse(BaseModel):
    id: str
    room_id: str
    user_id: str
    author_name: str
    user_role: str
    question: str
    answer: Optional[str] = None
    answered_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WebRTCSignalMessage(BaseModel):
    type: str = Field(..., description="'offer', 'answer', 'candidate', 'join', 'leave', 'chat'")
    room_id: str
    sender_id: Optional[str] = None
    sender_name: Optional[str] = None
    sender_role: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
