# app/api/pitches.py
"""Pitch Pipeline API endpoints for deck uploads, metadata validation, and Kafka event publishing."""

import os
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.startup import Startup
from app.models.pitch import Pitch, PitchStatus
from app.models.audit import AuditLog
from app.schemas.pitch import PitchCreate, PitchStatusUpdate, PitchResponse
from app.schemas.kafka_events import PitchSubmittedEvent, PitchRegisteredEvent
from app.core.dependencies import get_current_user, require_founder
from app.core.kafka_producer import kafka_producer
from app.core.websocket_manager import ws_manager

router = APIRouter(prefix="/pitches", tags=["Pitch Pipeline"])


@router.post("/upload", response_model=PitchResponse, status_code=status.HTTP_201_CREATED)
async def upload_pitch_deck(
    startup_id: str = Form(...),
    title: str = Form(...),
    summary: Optional[str] = Form(None),
    ask_amount: float = Form(..., gt=0),
    equity_percentage: float = Form(..., gt=0, le=100),
    video_url: Optional[str] = Form(None),
    deck_file: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """
    Step 1: Initiation
    A startup submits a pitch deck via the API Gateway.
    The file is stored, data is validated and persisted in PostgreSQL with PENDING status.
    
    Step 2: Event Publication
    An event payload containing metadata and file references is published to Kafka topics:
    - startup.pitches.submitted
    - pitch.registered
    """
    # Verify startup exists and user is owner/admin
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")

    if startup.founder_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the founder or admin can submit pitches for this startup"
        )

    # File saving logic
    deck_file_url = None
    if deck_file and deck_file.filename:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        filename_ext = os.path.splitext(deck_file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{filename_ext}"
        saved_file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        file_content = await deck_file.read()
        with open(saved_file_path, "wb") as f:
            f.write(file_content)
        deck_file_url = f"/uploads/{unique_filename}"

    # Calculate implied valuation
    implied_valuation = round(ask_amount / (equity_percentage / 100.0), 2)

    # 1. Persist in PostgreSQL with PENDING status
    pitch = Pitch(
        startup_id=startup.id,
        title=title,
        summary=summary,
        deck_file_url=deck_file_url,
        video_url=video_url,
        ask_amount=ask_amount,
        equity_percentage=equity_percentage,
        valuation=implied_valuation,
        status=PitchStatus.PENDING.value,
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(pitch)
    db.flush()

    # Create Audit Log
    audit = AuditLog(
        event_type="startup.pitches.submitted",
        entity_type="pitch",
        entity_id=pitch.id,
        payload=f'{{"startup_name": "{startup.name}", "ask_amount": {ask_amount}, "equity": {equity_percentage}}}',
        actor_id=current_user.id
    )
    db.add(audit)
    db.commit()
    db.refresh(pitch)

    # 2. Publish to Kafka topic: startup.pitches.submitted
    event_payload = PitchSubmittedEvent(
        event_id=str(uuid.uuid4()),
        pitch_id=pitch.id,
        startup_id=startup.id,
        startup_name=startup.name,
        founder_id=current_user.id,
        title=pitch.title,
        ask_amount=float(pitch.ask_amount),
        equity_percentage=float(pitch.equity_percentage),
        valuation=float(pitch.valuation),
        industry=startup.industry,
        deck_file_url=pitch.deck_file_url,
        status=pitch.status
    ).model_dump()

    await kafka_producer.send_event(
        topic=settings.KAFKA_TOPIC_PITCH_SUBMITTED,
        value=event_payload,
        key=pitch.id
    )

    # Also publish to pitch.registered / pitch-events for topic compatibility
    registered_event = PitchRegisteredEvent(
        event_id=str(uuid.uuid4()),
        pitch_id=pitch.id,
        startup_id=startup.id,
        title=pitch.title,
        deck_url=pitch.deck_file_url,
        status=pitch.status
    ).model_dump()

    await kafka_producer.send_event(
        topic=settings.KAFKA_TOPIC_PITCH_REGISTERED,
        value=registered_event,
        key=pitch.id
    )

    # Broadcast live alert to connected angel investors
    await ws_manager.broadcast_to_investors({
        "type": "NEW_PITCH_SUBMITTED",
        "pitch_id": pitch.id,
        "startup_name": startup.name,
        "title": pitch.title,
        "ask_amount": float(pitch.ask_amount),
        "equity_percentage": float(pitch.equity_percentage),
        "valuation": float(pitch.valuation),
        "industry": startup.industry,
        "deck_file_url": pitch.deck_file_url
    })

    return pitch


@router.post("", response_model=PitchResponse, status_code=status.HTTP_201_CREATED)
async def create_pitch_json(
    pitch_in: PitchCreate,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Submit a pitch deck using standard JSON payload."""
    startup = db.query(Startup).filter(Startup.id == pitch_in.startup_id).first()
    if not startup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")

    if startup.founder_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the founder or admin can submit pitches for this startup"
        )

    implied_valuation = round(pitch_in.ask_amount / (pitch_in.equity_percentage / 100.0), 2)

    pitch = Pitch(
        startup_id=startup.id,
        title=pitch_in.title,
        summary=pitch_in.summary,
        deck_file_url=pitch_in.deck_file_url,
        video_url=pitch_in.video_url,
        ask_amount=pitch_in.ask_amount,
        equity_percentage=pitch_in.equity_percentage,
        valuation=implied_valuation,
        status=PitchStatus.PENDING.value,
        scheduled_at=pitch_in.scheduled_at,
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(pitch)
    db.commit()
    db.refresh(pitch)

    # Publish to Kafka
    event_payload = PitchSubmittedEvent(
        event_id=str(uuid.uuid4()),
        pitch_id=pitch.id,
        startup_id=startup.id,
        startup_name=startup.name,
        founder_id=current_user.id,
        title=pitch.title,
        ask_amount=float(pitch.ask_amount),
        equity_percentage=float(pitch.equity_percentage),
        valuation=float(pitch.valuation),
        industry=startup.industry,
        deck_file_url=pitch.deck_file_url,
        status=pitch.status
    ).model_dump()

    await kafka_producer.send_event(
        topic=settings.KAFKA_TOPIC_PITCH_SUBMITTED,
        value=event_payload,
        key=pitch.id
    )

    return pitch


@router.get("", response_model=List[PitchResponse])
def list_pitches(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: PENDING, APPROVED, LIVE, FUNDED"),
    startup_id: Optional[str] = Query(None, description="Filter by startup"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """List pitch submissions with optional status and startup filters."""
    query = db.query(Pitch)
    if status_filter:
        query = query.filter(Pitch.status == status_filter.upper())
    if startup_id:
        query = query.filter(Pitch.startup_id == startup_id)
    return query.order_by(Pitch.submitted_at.desc()).offset(offset).limit(limit).all()


@router.get("/{pitch_id}", response_model=PitchResponse)
def get_pitch(pitch_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific pitch deck."""
    pitch = db.query(Pitch).filter(Pitch.id == pitch_id).first()
    if not pitch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pitch not found")
    return pitch


@router.patch("/{pitch_id}/status", response_model=PitchResponse)
async def update_pitch_status(
    pitch_id: str,
    status_in: PitchStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the status of a pitch (e.g. APPROVED, LIVE, FUNDED).
    If transitioning to LIVE, creates a room identifier for WebRTC session.
    """
    pitch = db.query(Pitch).filter(Pitch.id == pitch_id).first()
    if not pitch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pitch not found")

    pitch.status = status_in.status.value
    if status_in.live_room_id:
        pitch.live_room_id = status_in.live_room_id
    elif status_in.status == PitchStatus.LIVE and not pitch.live_room_id:
        pitch.live_room_id = f"pitch-room-{pitch.id[:8]}"

    db.commit()
    db.refresh(pitch)

    # Publish status change event to Kafka
    await kafka_producer.send_event(
        topic="pitch-events",
        value={
            "pitch_id": pitch.id,
            "status": pitch.status,
            "live_room_id": pitch.live_room_id,
            "updated_by": current_user.id
        },
        key=pitch.id
    )

    return pitch
