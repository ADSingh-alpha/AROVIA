# app/config.py
"""AROVIA Platform Configuration Settings."""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AROVIA"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_PORT: int = 8000
    API_BASE_URL: str = "http://localhost:8000"

    # Security & JWT Tokens (TSK-301)
    SECRET_KEY: str = "arovia_super_secret_jwt_signature_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Configuration (PostgreSQL / SQLite fallback)
    DATABASE_URL: str = "sqlite:///./arovia_dev.db"
    POSTGRES_DATABASE_URL: str = "postgresql+psycopg2://arovia_admin:arovia_secure_password_2026@localhost:5432/arovia_db"
    POSTGRES_USER: str = "arovia_admin"
    POSTGRES_PASSWORD: str = "arovia_secure_password_2026"
    POSTGRES_DB: str = "arovia_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # Redis Pub/Sub Cache (TSK-303)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # Kafka Cluster Configuration (KRaft Mode - TSK-101, TSK-304)
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092,localhost:9093,localhost:9094"
    KAFKA_CONSUMER_GROUP: str = "arovia-dealflow-group"
    KAFKA_TOPIC_PITCH_SUBMITTED: str = "startup.pitches.submitted"
    KAFKA_TOPIC_PITCH_REGISTERED: str = "pitch.registered"
    KAFKA_TOPIC_INVESTMENT_OFFERS: str = "investment-offers"
    KAFKA_TOPIC_COMMITMENT_ACCEPTED: str = "commitment.accepted"
    KAFKA_TOPIC_PITCH_DLQ: str = "startup.pitches.dlq"
    KAFKA_TOPIC_OFFERS_DLQ: str = "investment.offers.dlq"

    # File storage for pitch decks
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 25

    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_database_url(self) -> str:
        """Return the effective database URL with intelligent fallback."""
        # Check explicit env var first
        env_db = os.getenv("DATABASE_URL")
        if env_db:
            return env_db
        # If in Docker or postgres is explicitly configured
        if self.ENVIRONMENT == "production":
            return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return self.DATABASE_URL


settings = Settings()
