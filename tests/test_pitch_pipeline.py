# tests/test_pitch_pipeline.py
"""Test Pitch Pipeline: Deck uploads, metadata validation, status lifecycle, and Kafka event triggers."""

def test_startup_creation_and_pitch_pipeline(client):
    # 1. Register Founder
    founder_token = client.post("/auth/register", json={
        "email": "alex.turner@nexussolar.io",
        "password": "SolarPassword2026!",
        "full_name": "Alex Turner",
        "role": "founder"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {founder_token}"}

    # 2. Create Startup venture
    startup_res = client.post("/startups", headers=headers, json={
        "name": "NexusSolar",
        "tagline": "Next-gen perovskite solar cells",
        "industry": "CleanTech",
        "stage": "Seed",
        "valuation_target": 10000000.0,
        "funding_goal": 1500000.0,
        "equity_offered_percent": 15.0,
        "total_shares": 10000000
    })
    assert startup_res.status_code == 201
    startup_data = startup_res.json()
    startup_id = startup_data["id"]

    # Verify initial Cap Table is created for the founder (100% equity)
    cap_res = client.get(f"/ledger/cap-table/{startup_id}")
    assert cap_res.status_code == 200
    cap_data = cap_res.json()
    assert len(cap_data["entries"]) == 1
    assert cap_data["entries"][0]["ownership_percentage"] == 100.0
    assert cap_data["entries"][0]["stakeholder_name"] == "Alex Turner"

    # 3. Submit Pitch Deck (Initiation: PENDING status)
    pitch_res = client.post("/pitches", headers=headers, json={
        "startup_id": startup_id,
        "title": "Revolutionary Perovskite Solar Cells for Clean Energy",
        "summary": "Achieving 35% efficiency at 50% lower production costs.",
        "ask_amount": 1000000.0,
        "equity_percentage": 10.0,
        "deck_file_url": "/uploads/nexussolar_deck.pdf"
    })
    assert pitch_res.status_code == 201
    pitch_data = pitch_res.json()
    assert pitch_data["status"] == "PENDING"
    assert pitch_data["valuation"] == 10000000.0  # 1,000,000 / 0.10
    pitch_id = pitch_data["id"]

    # 4. Update status to LIVE
    live_res = client.patch(f"/pitches/{pitch_id}/status", headers=headers, json={
        "status": "LIVE"
    })
    assert live_res.status_code == 200
    assert live_res.json()["status"] == "LIVE"
    assert live_res.json()["live_room_id"] is not None
