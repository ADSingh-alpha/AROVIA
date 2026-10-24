# app/api/health.py
"""Health and readiness check endpoints for container orchestration."""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.core.redis_client import redis_service
from app.core.kafka_producer import kafka_producer

router = APIRouter(tags=["Health"])


@router.get("/health")
def liveness_check():
    """Liveness probe for Docker container health check."""
    return {"status": "healthy", "service": "arovia-backend", "version": "1.0.0"}


@router.get("/health/ready")
def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe checking database, redis, and kafka connectivity."""
    checks = {
        "database": False,
        "redis": redis_service.is_healthy(),
        "kafka": kafka_producer.is_healthy()
    }

    try:
        db.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception:
        checks["database"] = False

    is_ready = checks["database"]  # DB is critical requirement
    status_code = status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={"status": "ready" if is_ready else "degraded", "checks": checks}
    )
