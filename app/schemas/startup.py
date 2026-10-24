# app/schemas/startup.py
"""Pydantic schemas for Startup ventures and fundraising profile."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class StartupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    tagline: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    industry: str = Field(..., max_length=100)
    stage: str = Field(default="Seed", max_length=50)
    website: Optional[str] = None
    valuation_target: float = Field(default=0.0, ge=0)
    funding_goal: float = Field(default=0.0, ge=0)
    equity_offered_percent: float = Field(default=0.0, ge=0, le=100)
    total_shares: int = Field(default=10000000, gt=0)


class StartupUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    website: Optional[str] = None
    valuation_target: Optional[float] = None
    funding_goal: Optional[float] = None
    equity_offered_percent: Optional[float] = None


class StartupResponse(BaseModel):
    id: str
    founder_id: str
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    industry: str
    stage: str
    website: Optional[str] = None
    valuation_target: float
    funding_goal: float
    equity_offered_percent: float
    total_shares: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
