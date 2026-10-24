# app/main.py
"""AROVIA Platform — Core Backend & API Gateway.

Online Shark Tank Pitching Platform.
Handles REST, WebSockets, RBAC authentication, Kafka event pipelines, and ACID investment ledgers.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.core.kafka_producer import kafka_producer
from app.core.redis_client import redis_service
from app.api.auth import router as auth_router
from app.api.startups import router as startups_router
from app.api.pitches import router as pitches_router
from app.api.live_room import router as live_room_router
from app.api.ledger import router as ledger_router
from app.api.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for clean startup and shutdown."""
    # 1. Startup phase
    init_db()
    await redis_service.start()
    await kafka_producer.start()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    # 2. Shutdown phase
    await kafka_producer.stop()
    await redis_service.stop()


app = FastAPI(
    title="AROVIA Platform API",
    description="Online Shark Tank Pitching Platform — Core Backend, Kafka Event Pipelines & Investment Ledger",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for pitch deck uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(startups_router)
app.include_router(pitches_router)
app.include_router(live_room_router)
app.include_router(ledger_router)


@app.get("/")
def root_endpoint():
    """AROVIA Core Backend status and documentation index."""
    return {
        "platform": "AROVIA — Online Shark Tank Pitching Platform",
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs",
        "modules": [
            "Auth Service (JWT & RBAC: Founders, Angel Investors, Admins)",
            "Startups & Cap Table Directory",
            "Pitch Pipeline (Decks upload & Kafka 'startup.pitches.submitted' publisher)",
            "Live Room Service (WebSockets, WebRTC signaling & Q&A)",
            "Investment Ledger (Term sheets, Commitments & ACID Deal Closures)"
        ]
    }
