# app/core/redis_client.py
"""Redis client for caching, pub/sub, and WebRTC session state tracking."""

import logging
from typing import Optional, Any
import redis.asyncio as aioredis
from app.config import settings

logger = logging.getLogger(__name__)


class RedisService:
    def __init__(self):
        self._client: Optional[aioredis.Redis] = None
        self._is_connected: bool = False
        self._local_cache = {}

    async def start(self):
        """Connect to Redis server."""
        try:
            self._client = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=3.0,
                socket_connect_timeout=3.0
            )
            await self._client.ping()
            self._is_connected = True
            logger.info("Connected to Redis at %s", settings.REDIS_URL)
        except Exception as e:
            self._is_connected = False
            logger.warning("Redis server unavailable (%s). Running with in-memory fallback.", str(e))

    async def stop(self):
        """Close Redis connection."""
        if self._client and self._is_connected:
            try:
                await self._client.close()
                logger.info("Redis connection closed cleanly.")
            except Exception as e:
                logger.error("Error closing Redis connection: %s", str(e))
        self._is_connected = False

    async def get(self, key: str) -> Optional[str]:
        if self._is_connected and self._client:
            try:
                return await self._client.get(key)
            except Exception as e:
                logger.error("Redis get failed for %s: %s", key, str(e))
        return self._local_cache.get(key)

    async def set(self, key: str, value: str, expire: Optional[int] = None) -> bool:
        if self._is_connected and self._client:
            try:
                if expire:
                    await self._client.set(key, value, ex=expire)
                else:
                    await self._client.set(key, value)
                return True
            except Exception as e:
                logger.error("Redis set failed for %s: %s", key, str(e))
        self._local_cache[key] = value
        return True

    async def delete(self, key: str) -> bool:
        if self._is_connected and self._client:
            try:
                await self._client.delete(key)
                return True
            except Exception as e:
                logger.error("Redis delete failed for %s: %s", key, str(e))
        self._local_cache.pop(key, None)
        return True

    async def publish(self, channel: str, message: str) -> int:
        if self._is_connected and self._client:
            try:
                return await self._client.publish(channel, message)
            except Exception as e:
                logger.error("Redis publish failed on %s: %s", channel, str(e))
        return 0

    def is_healthy(self) -> bool:
        return self._is_connected


redis_service = RedisService()
