# app/api/startups.py
"""Startup management API endpoints for founder venture registrations and listings."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.startup import Startup
from app.models.ledger import CapTableLedger, StakeholderType, CapTableTransactionType
from app.schemas.startup import StartupCreate, StartupUpdate, StartupResponse
from app.core.dependencies import get_current_user, require_founder

router = APIRouter(prefix="/startups", tags=["Startups"])


@router.post("", response_model=StartupResponse, status_code=status.HTTP_201_CREATED)
def create_startup(
    startup_in: StartupCreate,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """
    Register a new startup venture.
    Restricted to founders and admins. Automatically sets up the initial Cap Table ledger.
    """
    startup = Startup(
        founder_id=current_user.id,
        name=startup_in.name,
        tagline=startup_in.tagline,
        description=startup_in.description,
        industry=startup_in.industry,
        stage=startup_in.stage,
        website=startup_in.website,
        valuation_target=startup_in.valuation_target,
        funding_goal=startup_in.funding_goal,
        equity_offered_percent=startup_in.equity_offered_percent,
        total_shares=startup_in.total_shares
    )
    db.add(startup)
    db.flush()  # Generates startup.id

    # Initialize Cap-Table entry with Founder's initial equity (100% of shares)
    initial_cap_entry = CapTableLedger(
        startup_id=startup.id,
        stakeholder_id=current_user.id,
        stakeholder_name=current_user.full_name,
        stakeholder_type=StakeholderType.FOUNDER.value,
        shares_allocated=startup.total_shares,
        ownership_percentage=100.0,
        transaction_type=CapTableTransactionType.INITIAL_EQUITY.value
    )
    db.add(initial_cap_entry)
    db.commit()
    db.refresh(startup)
    return startup


@router.get("", response_model=List[StartupResponse])
def list_startups(
    industry: Optional[str] = Query(None, description="Filter by industry"),
    stage: Optional[str] = Query(None, description="Filter by stage"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """List all registered startups on the platform with optional filters."""
    query = db.query(Startup)
    if industry:
        query = query.filter(Startup.industry.ilike(f"%{industry}%"))
    if stage:
        query = query.filter(Startup.stage.ilike(f"%{stage}%"))
    return query.order_by(Startup.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/my", response_model=List[StartupResponse])
def get_my_startups(
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Retrieve all startups founded by the authenticated user."""
    return db.query(Startup).filter(Startup.founder_id == current_user.id).all()


@router.get("/{startup_id}", response_model=StartupResponse)
def get_startup_by_id(startup_id: str, db: Session = Depends(get_db)):
    """Get full details of a specific startup."""
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup venture not found"
        )
    return startup


@router.put("/{startup_id}", response_model=StartupResponse)
def update_startup(
    startup_id: str,
    startup_in: StartupUpdate,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Update startup details. Only the founder or admin can perform updates."""
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")

    if startup.founder_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this startup")

    update_data = startup_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(startup, field, value)

    db.commit()
    db.refresh(startup)
    return startup
