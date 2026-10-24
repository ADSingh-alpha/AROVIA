# app/api/__init__.py
"""AROVIA API Routers Package."""

from app.api.auth import router as auth_router
from app.api.startups import router as startups_router
from app.api.pitches import router as pitches_router
from app.api.live_room import router as live_room_router
from app.api.ledger import router as ledger_router
from app.api.health import router as health_router

__all__ = [
    "auth_router",
    "startups_router",
    "pitches_router",
    "live_room_router",
    "ledger_router",
    "health_router",
]
