# tests/test_ledger_and_cap_table.py
"""Test Investment Ledger: Term sheets, commitments, ACID deal closures, and Cap Table dilution."""

def test_investment_ledger_and_acid_closure(client):
    # 1. Register Founder and create Startup + Pitch
    founder_token = client.post("/auth/register", json={
        "email": "elena@neurosync.ai",
        "password": "Password123!",
        "full_name": "Elena Rostova",
        "role": "founder"
    }).json()["access_token"]
    founder_headers = {"Authorization": f"Bearer {founder_token}"}

    startup_id = client.post("/startups", headers=founder_headers, json={
        "name": "NeuroSync",
        "industry": "AI / NeuroTech",
        "valuation_target": 20000000.0,
        "funding_goal": 2000000.0,
        "equity_offered_percent": 10.0,
        "total_shares": 10000000
    }).json()["id"]

    pitch_id = client.post("/pitches", headers=founder_headers, json={
        "startup_id": startup_id,
        "title": "Brain-Computer Interface for Enterprise Workflow",
        "ask_amount": 2000000.0,
        "equity_percentage": 10.0
    }).json()["id"]

    # 2. Register Angel Investor
    investor_token = client.post("/auth/register", json={
        "email": "marcus.shark@venture.com",
        "password": "SharkPassword123!",
        "full_name": "Marcus Vance",
        "role": "investor",
        "accredited_investor": True
    }).json()["access_token"]
    investor_headers = {"Authorization": f"Bearer {investor_token}"}

    # 3. Investor submits Term Sheet (Offer)
    term_res = client.post("/ledger/terms", headers=investor_headers, json={
        "pitch_id": pitch_id,
        "offered_amount": 2000000.0,
        "equity_percent": 10.0,
        "board_seat": True,
        "special_conditions": "1 board seat + monthly financial reports"
    })
    assert term_res.status_code == 201
    term_data = term_res.json()
    assert term_data["status"] == "PROPOSED"
    assert term_data["implied_valuation"] == 20000000.0
    term_sheet_id = term_data["id"]

    # 4. Execute Deal Closure (ACID transaction)
    deal_res = client.post("/ledger/commitments", headers=investor_headers, json={
        "pitch_id": pitch_id,
        "startup_id": startup_id,
        "term_sheet_id": term_sheet_id,
        "amount": 2000000.0,
        "equity_percent": 10.0
    })
    assert deal_res.status_code == 201
    deal_data = deal_res.json()
    assert deal_data["status"] == "COMPLETED"
    assert "AROVIA-TX-" in deal_data["transaction_reference"]

    # 5. Verify Cap Table is updated with diluted founder equity and new investor allocation
    cap_res = client.get(f"/ledger/cap-table/{startup_id}")
    assert cap_res.status_code == 200
    cap_data = cap_res.json()

    # Total allocated shares = 10,000,000 (initial) + 1,000,000 (investor)
    assert len(cap_data["entries"]) == 2

    # Check founder entry (diluted to 90%)
    founder_entry = next(e for e in cap_data["entries"] if e["stakeholder_name"] == "Elena Rostova")
    assert round(founder_entry["ownership_percentage"], 1) == 90.0

    # Check investor entry (10% equity)
    investor_entry = next(e for e in cap_data["entries"] if e["stakeholder_name"] == "Marcus Vance")
    assert investor_entry["ownership_percentage"] == 10.0
    assert investor_entry["shares_allocated"] == 1000000

    # 6. Verify Pitch status is updated to FUNDED
    pitch_res = client.get(f"/pitches/{pitch_id}")
    assert pitch_res.json()["status"] == "FUNDED"
