# app/api/live_room.py
"""Live Room Service: WebRTC signaling backend for real-time virtual pitching rooms and live Q&A logging."""

import json
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.pitch import Pitch, PitchStatus
from app.models.live_room import LiveRoomSession, LiveQALog
from app.schemas.live_room import (
    LiveRoomCreate,
    LiveRoomResponse,
    QACreate,
    QAAnswer,
    QAResponse,
    WebRTCSignalMessage,
)
from app.core.dependencies import get_current_user, require_founder
from app.core.security import decode_access_token
from app.core.websocket_manager import ws_manager
from app.core.redis_client import redis_service

router = APIRouter(tags=["Live Pitching Room & WebRTC"])


@router.post("/live/rooms", response_model=LiveRoomResponse, status_code=status.HTTP_201_CREATED)
def create_or_join_room(
    room_in: LiveRoomCreate,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Create or initialize a WebRTC pitching room for a pitch."""
    pitch = db.query(Pitch).filter(Pitch.id == room_in.pitch_id).first()
    if not pitch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pitch not found")

    room_id = room_in.room_id or f"room-{pitch.id[:8]}"
    existing_room = db.query(LiveRoomSession).filter(LiveRoomSession.room_id == room_id).first()
    if existing_room:
        if not existing_room.is_active:
            existing_room.is_active = True
            existing_room.started_at = datetime.now(timezone.utc)
            existing_room.ended_at = None
            db.commit()
            db.refresh(existing_room)
        return existing_room

    # Create new session
    session = LiveRoomSession(
        room_id=room_id,
        pitch_id=pitch.id,
        host_founder_id=current_user.id,
        is_active=True
    )
    db.add(session)
    pitch.status = PitchStatus.LIVE.value
    pitch.live_room_id = room_id
    db.commit()
    db.refresh(session)
    return session


@router.get("/live/rooms/{room_id}", response_model=LiveRoomResponse)
def get_room_details(room_id: str, db: Session = Depends(get_db)):
    """Retrieve details and active state of a live pitch room."""
    session = db.query(LiveRoomSession).filter(LiveRoomSession.room_id == room_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Live room not found")
    return session


@router.post("/live/rooms/{room_id}/end", response_model=LiveRoomResponse)
def end_room_session(
    room_id: str,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """End a pitching session and deactivate WebRTC room."""
    session = db.query(LiveRoomSession).filter(LiveRoomSession.room_id == room_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Live room not found")

    if session.host_founder_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to close this room")

    session.is_active = False
    session.ended_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return session


@router.websocket("/ws/live/{room_id}")
async def webrtc_signaling_endpoint(
    websocket: WebSocket,
    room_id: str,
    token: Optional[str] = Query(None)
):
    """
    WebRTC Signaling Gateway:
    Handles SDP Offer, SDP Answer, ICE Candidate exchange, and Live Chat between
    Startup Founder, Angel Investors, and Attendees.
    """
    user_info = {"id": "anonymous", "name": "Guest Attendee", "role": "viewer"}
    if token:
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_info = {
                "id": payload.get("sub"),
                "name": payload.get("email", "User"),
                "role": payload.get("role", "viewer")
            }

    await ws_manager.connect_room(room_id, websocket)

    # Announce peer joined to other peers
    join_signal = {
        "type": "peer-joined",
        "room_id": room_id,
        "sender_id": user_info["id"],
        "sender_name": user_info["name"],
        "sender_role": user_info["role"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await ws_manager.broadcast_to_room(room_id, join_signal, exclude=websocket)

    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                data = json.loads(raw_text)
            except Exception:
                continue

            # Enrich message with authenticated sender metadata
            data["room_id"] = room_id
            data["sender_id"] = user_info["id"]
            data["sender_name"] = user_info["name"]
            data["sender_role"] = user_info["role"]
            data["timestamp"] = datetime.now(timezone.utc).isoformat()

            # Relay WebRTC signaling: offer, answer, candidate, chat
            await ws_manager.broadcast_to_room(room_id, data, exclude=websocket)

            # Sync over Redis pub/sub for multi-pod horizontal scaling
            await redis_service.publish(f"arovia:room:{room_id}", json.dumps(data))

    except WebSocketDisconnect:
        ws_manager.disconnect_room(room_id, websocket)
        leave_signal = {
            "type": "peer-left",
            "room_id": room_id,
            "sender_id": user_info["id"],
            "sender_name": user_info["name"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await ws_manager.broadcast_to_room(room_id, leave_signal)


# -----------------------------------------------------------------------------
# Live Text Q&A Logging
# -----------------------------------------------------------------------------

@router.post("/live/{room_id}/qa", response_model=QAResponse, status_code=status.HTTP_201_CREATED)
async def post_qa_question(
    room_id: str,
    qa_in: QACreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ask a live question during the virtual pitching session."""
    qa_log = LiveQALog(
        room_id=room_id,
        user_id=current_user.id,
        author_name=current_user.full_name,
        user_role=current_user.role,
        question=qa_in.question
    )
    db.add(qa_log)
    db.commit()
    db.refresh(qa_log)

    # Broadcast question live to WebRTC room participants
    await ws_manager.broadcast_to_room(room_id, {
        "type": "NEW_QUESTION",
        "qa_id": qa_log.id,
        "author": current_user.full_name,
        "role": current_user.role,
        "question": qa_log.question,
        "created_at": qa_log.created_at.isoformat()
    })

    return qa_log


@router.get("/live/{room_id}/qa", response_model=List[QAResponse])
def get_room_qa_logs(room_id: str, db: Session = Depends(get_db)):
    """Retrieve full audit log of questions and answers in a pitching room."""
    return db.query(LiveQALog).filter(LiveQALog.room_id == room_id).order_by(LiveQALog.created_at.asc()).all()


@router.patch("/live/{room_id}/qa/{qa_id}/answer", response_model=QAResponse)
async def answer_qa_question(
    room_id: str,
    qa_id: str,
    answer_in: QAAnswer,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Founder or host answers a question during the pitch."""
    qa_log = db.query(LiveQALog).filter(LiveQALog.id == qa_id, LiveQALog.room_id == room_id).first()
    if not qa_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    qa_log.answer = answer_in.answer
    qa_log.answered_by = current_user.id
    db.commit()
    db.refresh(qa_log)

    # Broadcast answer to all participants
    await ws_manager.broadcast_to_room(room_id, {
        "type": "QUESTION_ANSWERED",
        "qa_id": qa_log.id,
        "answer": qa_log.answer,
        "answered_by_name": current_user.full_name
    })

    return qa_log


@router.websocket("/ws/notifications")
async def dealflow_notifications_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """
    WebSocket channel for Angel Investors and Founders to receive real-time deal flow alerts
    (new pitch submissions, term sheet updates, deal closures).
    """
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = payload.get("sub")
    role = payload.get("role", "viewer")

    await ws_manager.connect_user(user_id, role, websocket)
    try:
        while True:
            # Keep-alive ping/pong
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_user(user_id, role, websocket)
