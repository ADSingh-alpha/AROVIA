# app/schemas/ledger.py
"""Pydantic schemas for Investment Ledger: Term sheets, Commitments, and Cap Table."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.ledger import TermSheetStatus, CommitmentStatus, StakeholderType, CapTableTransactionType


class TermSheetCreate(BaseModel):
    pitch_id: str
    offered_amount: float = Field(..., gt=0)
    equity_percent: float = Field(..., gt=0, le=100)
    implied_valuation: Optional[float] = None
    advisory_shares_percent: float = Field(default=0.0, ge=0, le=50)
    board_seat: bool = False
    special_conditions: Optional[str] = None


class TermSheetStatusUpdate(BaseModel):
    status: TermSheetStatus
    special_conditions: Optional[str] = None


class TermSheetResponse(BaseModel):
    id: str
    pitch_id: str
    investor_id: str
    offered_amount: float
    equity_percent: float
    implied_valuation: float
    advisory_shares_percent: float
    board_seat: bool
    special_conditions: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommitmentCreate(BaseModel):
    pitch_id: str
    startup_id: str
    term_sheet_id: Optional[str] = None
    amount: float = Field(..., gt=0)
    equity_percent: float = Field(..., gt=0, le=100)


class CommitmentResponse(BaseModel):
    id: str
    term_sheet_id: Optional[str] = None
    pitch_id: str
    startup_id: str
    investor_id: str
    amount: float
    equity_percent: float
    status: str
    transaction_reference: str
    closure_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CapTableEntryResponse(BaseModel):
    id: str
    startup_id: str
    stakeholder_id: Optional[str] = None
    stakeholder_name: str
    stakeholder_type: str
    shares_allocated: int
    ownership_percentage: float
    transaction_type: str
    effective_date: datetime

    class Config:
        from_attributes = True


class CapTableSummaryResponse(BaseModel):
    startup_id: str
    startup_name: str
    total_shares: int
    allocated_shares: int
    unallocated_shares: int
    entries: List[CapTableEntryResponse]
