from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.database import Base, get_db
from app.main import app

# In-memory SQLite for test isolation with StaticPool
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def mock_external_services():
    """Mock Kafka and Redis so tests run instantly and don't timeout trying to connect."""
    with patch("app.core.kafka_producer.kafka_producer.start", new_callable=AsyncMock), \
         patch("app.core.kafka_producer.kafka_producer.stop", new_callable=AsyncMock), \
         patch("app.core.kafka_producer.kafka_producer.send_event", new_callable=AsyncMock, return_value=True), \
         patch("app.core.redis_client.redis_service.start", new_callable=AsyncMock), \
         patch("app.core.redis_client.redis_service.stop", new_callable=AsyncMock), \
         patch("app.core.redis_client.redis_service.publish", new_callable=AsyncMock, return_value=1):
        yield


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
