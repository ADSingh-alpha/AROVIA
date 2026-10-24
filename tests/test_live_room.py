# tests/test_live_room.py
"""Test Live Room Sessions, WebRTC management, Q&A logging, and Health checks."""

def test_live_room_and_qa_logging(client):
    # 1. Register Founder and create Startup + Pitch
    founder_token = client.post("/auth/register", json={
        "email": "david.live@virtualshark.io",
        "password": "Password123!",
        "full_name": "David Miller",
        "role": "founder"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {founder_token}"}

    startup_id = client.post("/startups", headers=headers, json={
        "name": "LiveRoomTech",
        "industry": "MediaTech",
        "valuation_target": 5000000.0,
        "funding_goal": 500000.0,
        "equity_offered_percent": 10.0
    }).json()["id"]

    pitch_id = client.post("/pitches", headers=headers, json={
        "startup_id": startup_id,
        "title": "Interactive 3D Virtual Pitch Rooms",
        "ask_amount": 500000.0,
        "equity_percentage": 10.0
    }).json()["id"]

    # 2. Create Live Room Session
    room_res = client.post("/live/rooms", headers=headers, json={
        "pitch_id": pitch_id,
        "room_id": "room-demo-123"
    })
    assert room_res.status_code == 201
    assert room_res.json()["room_id"] == "room-demo-123"
    assert room_res.json()["is_active"] is True

    # 3. Post a Live Question
    qa_res = client.post("/live/room-demo-123/qa", headers=headers, json={
        "question": "What is your customer acquisition cost (CAC)?"
    })
    assert qa_res.status_code == 201
    qa_id = qa_res.json()["id"]
    assert qa_res.json()["question"] == "What is your customer acquisition cost (CAC)?"

    # 4. Founder answers the Question
    ans_res = client.patch(f"/live/room-demo-123/qa/{qa_id}/answer", headers=headers, json={
        "answer": "Our blended CAC is currently $14 per active user with an LTV of $180."
    })
    assert ans_res.status_code == 200
    assert ans_res.json()["answer"] == "Our blended CAC is currently $14 per active user with an LTV of $180."

    # 5. Retrieve all Q&A for room
    get_qa_res = client.get("/live/room-demo-123/qa")
    assert get_qa_res.status_code == 200
    assert len(get_qa_res.json()) >= 1


def test_health_endpoints(client):
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"

    ready_res = client.get("/health/ready")
    assert ready_res.status_code == 200
    assert "checks" in ready_res.json()
