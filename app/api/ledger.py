# app/api/ledger.py
"""Investment Ledger API: Term Sheets, Commitments, ACID Deal Closures, and Cap-Table Ledgers."""

import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.pitch import Pitch, PitchStatus
from app.models.startup import Startup
from app.models.ledger import (
    FundingTerm,
    TermSheetStatus,
    InvestmentCommitment,
    CommitmentStatus,
    CapTableLedger,
    StakeholderType,
    CapTableTransactionType,
)
from app.models.audit import AuditLog
from app.schemas.ledger import (
    TermSheetCreate,
    TermSheetStatusUpdate,
    TermSheetResponse,
    CommitmentCreate,
    CommitmentResponse,
    CapTableEntryResponse,
    CapTableSummaryResponse,
)
from app.schemas.kafka_events import OfferSubmittedEvent, CommitmentAcceptedEvent
from app.core.dependencies import get_current_user, require_investor, require_founder
from app.core.kafka_producer import kafka_producer
from app.core.websocket_manager import ws_manager

router = APIRouter(prefix="/ledger", tags=["Investment Ledger & Cap Table"])


@router.post("/terms", response_model=TermSheetResponse, status_code=status.HTTP_201_CREATED)
async def submit_term_sheet(
    term_in: TermSheetCreate,
    current_user: User = Depends(require_investor),
    db: Session = Depends(get_db)
):
    """
    Angel Investor submits a formal term sheet / investment offer.
    Emits an event to Kafka topic 'investment-offers' and notifies the startup founder.
    """
    pitch = db.query(Pitch).filter(Pitch.id == term_in.pitch_id).first()
    if not pitch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pitch not found")

    implied_val = term_in.implied_valuation or round(term_in.offered_amount / (term_in.equity_percent / 100.0), 2)

    term_sheet = FundingTerm(
        pitch_id=pitch.id,
        investor_id=current_user.id,
        offered_amount=term_in.offered_amount,
        equity_percent=term_in.equity_percent,
        implied_valuation=implied_val,
        advisory_shares_percent=term_in.advisory_shares_percent,
        board_seat=term_in.board_seat,
        special_conditions=term_in.special_conditions,
        status=TermSheetStatus.PROPOSED.value
    )
    db.add(term_sheet)
    db.commit()
    db.refresh(term_sheet)

    # 1. Publish to Kafka topic 'investment-offers'
    event_payload = OfferSubmittedEvent(
        event_id=str(uuid.uuid4()),
        term_sheet_id=term_sheet.id,
        pitch_id=pitch.id,
        investor_id=current_user.id,
        investor_name=current_user.full_name,
        offered_amount=float(term_sheet.offered_amount),
        equity_percent=float(term_sheet.equity_percent),
        implied_valuation=float(term_sheet.implied_valuation)
    ).model_dump()

    await kafka_producer.send_event(
        topic="investment-offers",
        value=event_payload,
        key=term_sheet.id
    )

    # 2. Notify startup founder in real-time
    startup = db.query(Startup).filter(Startup.id == pitch.startup_id).first()
    if startup:
        await ws_manager.send_to_user(startup.founder_id, {
            "type": "NEW_OFFER_RECEIVED",
            "term_sheet_id": term_sheet.id,
            "pitch_id": pitch.id,
            "investor_name": current_user.full_name,
            "offered_amount": float(term_sheet.offered_amount),
            "equity_percent": float(term_sheet.equity_percent)
        })

    return term_sheet


@router.get("/terms/pitch/{pitch_id}", response_model=List[TermSheetResponse])
def get_term_sheets_for_pitch(pitch_id: str, db: Session = Depends(get_db)):
    """Retrieve all term sheets submitted for a given pitch."""
    return db.query(FundingTerm).filter(FundingTerm.pitch_id == pitch_id).order_by(FundingTerm.created_at.desc()).all()


@router.patch("/terms/{term_id}/status", response_model=TermSheetResponse)
def update_term_sheet_status(
    term_id: str,
    status_in: TermSheetStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Founder counters, accepts, or rejects an investor term sheet."""
    term_sheet = db.query(FundingTerm).filter(FundingTerm.id == term_id).first()
    if not term_sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term sheet not found")

    term_sheet.status = status_in.status.value
    if status_in.special_conditions:
        term_sheet.special_conditions = status_in.special_conditions

    db.commit()
    db.refresh(term_sheet)
    return term_sheet


@router.post("/commitments", response_model=CommitmentResponse, status_code=status.HTTP_201_CREATED)
async def execute_deal_closure(
    commitment_in: CommitmentCreate,
    current_user: User = Depends(require_investor),
    db: Session = Depends(get_db)
):
    """
    ACID Deal Closure:
    Executes an atomic funding commitment, allocates equity shares, dilutes prior stakeholders,
    inserts an immutable Cap Table ledger record, and marks the pitch as FUNDED.
    """
    pitch = db.query(Pitch).filter(Pitch.id == commitment_in.pitch_id).first()
    if not pitch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pitch not found")

    startup = db.query(Startup).filter(Startup.id == commitment_in.startup_id).first()
    if not startup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")

    # Start atomic ACID transaction
    try:
        tx_ref = f"AROVIA-TX-{uuid.uuid4().hex[:12].upper()}"

        commitment = InvestmentCommitment(
            term_sheet_id=commitment_in.term_sheet_id,
            pitch_id=pitch.id,
            startup_id=startup.id,
            investor_id=current_user.id,
            amount=commitment_in.amount,
            equity_percent=commitment_in.equity_percent,
            status=CommitmentStatus.COMPLETED.value,
            transaction_reference=tx_ref,
            closure_date=datetime.now(timezone.utc)
        )
        db.add(commitment)
        db.flush()  # Generates commitment.id

        # Cap Table Calculation
        equity_ratio = float(commitment_in.equity_percent) / 100.0
        investor_shares = int(startup.total_shares * equity_ratio)

        # Fetch existing active cap table entries
        existing_entries = db.query(CapTableLedger).filter(CapTableLedger.startup_id == startup.id).all()
        # Proportionally dilute existing stakeholders
        for entry in existing_entries:
            diluted_pct = float(entry.ownership_percentage) * (1.0 - equity_ratio)
            entry.ownership_percentage = round(diluted_pct, 4)

        # Allocate investor shares into Cap Table
        investor_cap_entry = CapTableLedger(
            startup_id=startup.id,
            stakeholder_id=current_user.id,
            stakeholder_name=current_user.full_name,
            stakeholder_type=StakeholderType.INVESTOR.value,
            shares_allocated=investor_shares,
            ownership_percentage=commitment_in.equity_percent,
            transaction_type=CapTableTransactionType.SERIES_SEED_INVESTMENT.value
        )
        db.add(investor_cap_entry)

        # Update Pitch status to FUNDED
        pitch.status = PitchStatus.FUNDED.value

        # Record in Audit Log
        audit = AuditLog(
            event_type="commitment.accepted",
            entity_type="investment_commitment",
            entity_id=commitment.id,
            payload=f'{{"tx_ref": "{tx_ref}", "amount": {commitment_in.amount}, "equity": {commitment_in.equity_percent}}}',
            actor_id=current_user.id
        )
        db.add(audit)

        # Commit all atomically
        db.commit()
        db.refresh(commitment)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ACID deal closure failed: {str(e)}"
        )

    # Publish commitment event to Kafka
    event_payload = CommitmentAcceptedEvent(
        event_id=str(uuid.uuid4()),
        commitment_id=commitment.id,
        pitch_id=pitch.id,
        startup_id=startup.id,
        investor_id=current_user.id,
        amount=float(commitment.amount),
        equity_percent=float(commitment.equity_percent),
        transaction_reference=commitment.transaction_reference
    ).model_dump()

    await kafka_producer.send_event(
        topic="commitment.accepted",
        value=event_payload,
        key=commitment.id
    )

    # Broadcast notification to founder
    await ws_manager.send_to_user(startup.founder_id, {
        "type": "DEAL_CLOSED",
        "pitch_id": pitch.id,
        "investor_name": current_user.full_name,
        "amount": float(commitment.amount),
        "transaction_ref": commitment.transaction_reference
    })

    return commitment


@router.get("/cap-table/{startup_id}", response_model=CapTableSummaryResponse)
def get_startup_cap_table(startup_id: str, db: Session = Depends(get_db)):
    """Retrieve full auditable capitalization table with stakeholder allocations."""
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")

    entries = db.query(CapTableLedger).filter(CapTableLedger.startup_id == startup_id).order_by(CapTableLedger.effective_date.asc()).all()

    total_shares = startup.total_shares
    allocated_shares = sum(e.shares_allocated for e in entries)
    unallocated_shares = max(0, total_shares - allocated_shares)

    return CapTableSummaryResponse(
        startup_id=startup.id,
        startup_name=startup.name,
        total_shares=total_shares,
        allocated_shares=allocated_shares,
        unallocated_shares=unallocated_shares,
        entries=entries
    )
