# tests/test_auth.py
"""Test authentication and RBAC endpoints."""

def test_user_registration_and_login(client):
    # 1. Register a Founder
    reg_response = client.post("/auth/register", json={
        "email": "sarah.chen@quantumbio.com",
        "password": "SecurePassword123!",
        "full_name": "Dr. Sarah Chen",
        "role": "founder",
        "organization": "QuantumBio Labs"
    })
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert "access_token" in reg_data
    assert reg_data["role"] == "founder"
    assert reg_data["email"] == "sarah.chen@quantumbio.com"

    # 2. Login
    login_response = client.post("/auth/login", json={
        "email": "sarah.chen@quantumbio.com",
        "password": "SecurePassword123!"
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    # 3. Access /auth/me with Bearer token
    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    user_data = me_response.json()
    assert user_data["email"] == "sarah.chen@quantumbio.com"
    assert user_data["full_name"] == "Dr. Sarah Chen"
    assert user_data["role"] == "founder"


def test_investor_registration(client):
    reg_response = client.post("/auth/register", json={
        "email": "kevin.shark@vance.vc",
        "password": "SharkPassword2026!",
        "full_name": "Kevin O'Leary Shark",
        "role": "investor",
        "organization": "Shark Ventures",
        "accredited_investor": True
    })
    assert reg_response.status_code == 201
    assert reg_response.json()["role"] == "investor"
