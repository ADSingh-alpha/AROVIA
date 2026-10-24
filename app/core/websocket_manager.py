# app/core/websocket_manager.py
"""WebSocket connection manager for WebRTC signaling and real-time deal alerts."""

import json
import logging
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Room WebRTC connections: room_id -> list of active WebSockets
        self.active_rooms: Dict[str, List[WebSocket]] = {}
        # User notification connections: user_id -> list of WebSockets
        self.user_connections: Dict[str, List[WebSocket]] = {}
        # Role subscriptions (e.g. 'investor', 'founder') -> list of WebSockets
        self.role_connections: Dict[str, List[WebSocket]] = {
            "investor": [],
            "founder": [],
            "admin": []
        }

    async def connect_room(self, room_id: str, websocket: WebSocket):
        """Accept and register a WebSocket client into a pitch live room."""
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []
        self.active_rooms[room_id].append(websocket)
        logger.info("WebSocket joined room %s. Total in room: %d", room_id, len(self.active_rooms[room_id]))

    def disconnect_room(self, room_id: str, websocket: WebSocket):
        """Remove a WebSocket from a pitch room."""
        if room_id in self.active_rooms:
            if websocket in self.active_rooms[room_id]:
                self.active_rooms[room_id].remove(websocket)
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]
        logger.info("WebSocket disconnected from room %s", room_id)

    async def broadcast_to_room(self, room_id: str, message: Dict[str, Any], exclude: WebSocket = None):
        """Broadcast a WebRTC signal or message to all clients in a specific room."""
        if room_id in self.active_rooms:
            text_data = json.dumps(message)
            for connection in self.active_rooms[room_id]:
                if connection != exclude:
                    try:
                        await connection.send_text(text_data)
                    except Exception as e:
                        logger.error("Failed to broadcast message to room client: %s", str(e))

    async def connect_user(self, user_id: str, role: str, websocket: WebSocket):
        """Register a user WebSocket connection for real-time notification alerts."""
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

        if role in self.role_connections:
            self.role_connections[role].append(websocket)
        logger.info("User %s (%s) connected for notifications", user_id, role)

    def disconnect_user(self, user_id: str, role: str, websocket: WebSocket):
        """Unregister a user's notification socket."""
        if user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

        if role in self.role_connections and websocket in self.role_connections[role]:
            self.role_connections[role].remove(websocket)

    async def broadcast_to_investors(self, alert_payload: Dict[str, Any]):
        """Broadcast live deal-flow alert to all active angel investors."""
        text_data = json.dumps(alert_payload)
        stale_sockets = []
        for ws in self.role_connections.get("investor", []):
            try:
                await ws.send_text(text_data)
            except Exception:
                stale_sockets.append(ws)

        for stale in stale_sockets:
            if stale in self.role_connections.get("investor", []):
                self.role_connections["investor"].remove(stale)

    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """Send a message to a specific user across all their active sessions."""
        if user_id in self.user_connections:
            text_data = json.dumps(message)
            for ws in self.user_connections[user_id]:
                try:
                    await ws.send_text(text_data)
                except Exception as e:
                    logger.error("Failed to send notification to user %s: %s", user_id, str(e))


ws_manager = ConnectionManager()
