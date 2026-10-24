# app/schemas/pitch.py
"""Pydantic schemas for Pitch deck submissions and live pitching pipeline."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.pitch import PitchStatus


class PitchCreate(BaseModel):
    startup_id: str
    title: str = Field(..., min_length=3, max_length=255)
    summary: Optional[str] = None
    ask_amount: float = Field(..., gt=0, description="Funding asked in USD")
    equity_percentage: float = Field(..., gt=0, le=100, description="Equity offered percentage")
    deck_file_url: Optional[str] = None
    video_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class PitchStatusUpdate(BaseModel):
    status: PitchStatus
    live_room_id: Optional[str] = None


class PitchResponse(BaseModel):
    id: str
    startup_id: str
    title: str
    summary: Optional[str] = None
    deck_file_url: Optional[str] = None
    video_url: Optional[str] = None
    ask_amount: float
    equity_percentage: float
    valuation: Optional[float] = None
    status: str
    live_room_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    submitted_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
