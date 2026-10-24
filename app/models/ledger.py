# app/models/ledger.py
"""Investment Ledger models: Funding Terms, Commitments, and Cap-Table Ledgers."""

import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Numeric, BigInteger, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TermSheetStatus(str, enum.Enum):
    PROPOSED = "PROPOSED"
    COUNTERED = "COUNTERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    SUPERSEDED = "SUPERSEDED"


class CommitmentStatus(str, enum.Enum):
    COMMITTED = "COMMITTED"
    ESCROW_FUNDED = "ESCROW_FUNDED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class StakeholderType(str, enum.Enum):
    FOUNDER = "founder"
    INVESTOR = "investor"
    EMPLOYEE_POOL = "employee_pool"
    ADVISOR = "advisor"


class CapTableTransactionType(str, enum.Enum):
    INITIAL_EQUITY = "INITIAL_EQUITY"
    SERIES_SEED_INVESTMENT = "SERIES_SEED_INVESTMENT"
    DILUTION_ADJUSTMENT = "DILUTION_ADJUSTMENT"
    TRANSFER = "TRANSFER"


class FundingTerm(Base):
    """Term Sheet / Investment Offer submitted by an Angel Investor."""
    __tablename__ = "funding_terms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    pitch_id = Column(String(36), ForeignKey("pitches.id", ondelete="CASCADE"), nullable=False, index=True)
    investor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    offered_amount = Column(Numeric(15, 2), nullable=False)
    equity_percent = Column(Numeric(5, 2), nullable=False)
    implied_valuation = Column(Numeric(15, 2), nullable=False)
    advisory_shares_percent = Column(Numeric(5, 2), default=0.00)
    board_seat = Column(Boolean, default=False)
    special_conditions = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default=TermSheetStatus.PROPOSED.value, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    pitch = relationship("Pitch", back_populates="funding_terms")
    investor = relationship("User", back_populates="funding_terms")
    commitments = relationship("InvestmentCommitment", back_populates="term_sheet")


class InvestmentCommitment(Base):
    """Binding transaction record for agreed funding and deal closure."""
    __tablename__ = "investment_commitments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    term_sheet_id = Column(String(36), ForeignKey("funding_terms.id", ondelete="SET NULL"), nullable=True)
    pitch_id = Column(String(36), ForeignKey("pitches.id", ondelete="CASCADE"), nullable=False, index=True)
    startup_id = Column(String(36), ForeignKey("startups.id", ondelete="CASCADE"), nullable=False, index=True)
    investor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(15, 2), nullable=False)
    equity_percent = Column(Numeric(5, 2), nullable=False)
    status = Column(String(50), nullable=False, default=CommitmentStatus.COMMITTED.value, index=True)
    transaction_reference = Column(String(100), unique=True, nullable=False, default=lambda: f"AROVIA-TX-{uuid.uuid4().hex[:12].upper()}")
    closure_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    term_sheet = relationship("FundingTerm", back_populates="commitments")
    pitch = relationship("Pitch", back_populates="commitments")
    startup = relationship("Startup", back_populates="commitments")
    investor = relationship("User", back_populates="commitments")


class CapTableLedger(Base):
    """Immutable audit trail for equity and capitalization table allocations."""
    __tablename__ = "cap_table_ledgers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    startup_id = Column(String(36), ForeignKey("startups.id", ondelete="CASCADE"), nullable=False, index=True)
    stakeholder_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    stakeholder_name = Column(String(255), nullable=False)
    stakeholder_type = Column(String(50), nullable=False, default=StakeholderType.FOUNDER.value)
    shares_allocated = Column(BigInteger, nullable=False)
    ownership_percentage = Column(Numeric(7, 4), nullable=False)
    transaction_type = Column(String(50), nullable=False, default=CapTableTransactionType.INITIAL_EQUITY.value)
    effective_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    startup = relationship("Startup", back_populates="cap_table_entries")
