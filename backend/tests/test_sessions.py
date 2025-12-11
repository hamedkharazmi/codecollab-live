"""Tests for session endpoints."""

import pytest
from fastapi.testclient import TestClient


def test_create_session(client: TestClient):
    """Test creating a new session."""
    response = client.post("/sessions", json={"hostName": "John Doe"})
    assert response.status_code == 201
    data = response.json()
    assert "sessionId" in data
    assert "shareLink" in data
    assert len(data["sessionId"]) > 0
    assert "/interview/" in data["shareLink"]


def test_get_session_existing(client: TestClient):
    """Test getting an existing session."""
    # Create a session
    create_response = client.post("/sessions", json={"hostName": "Host"})
    session_id = create_response.json()["sessionId"]

    # Get the session
    response = client.get(f"/sessions/{session_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == session_id
    assert data["code"] is not None
    assert data["language"] == "javascript"
    assert len(data["participants"]) == 1
    assert data["participants"][0]["name"] == "Host"
    assert data["participants"][0]["isHost"] is True
    assert data["isActive"] is True


def test_get_session_not_found(client: TestClient):
    """Test getting a non-existent session."""
    response = client.get("/sessions/invalid-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Session not found"


def test_join_session(client: TestClient):
    """Test joining a session."""
    # Create a session
    create_response = client.post("/sessions", json={"hostName": "Host"})
    session_id = create_response.json()["sessionId"]

    # Join the session
    response = client.post(
        f"/sessions/{session_id}/join",
        json={"userName": "Candidate"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "session" in data
    assert "userId" in data
    assert len(data["session"]["participants"]) == 2

    # Check participants
    participants = data["session"]["participants"]
    names = {p["name"] for p in participants}
    assert "Host" in names
    assert "Candidate" in names


def test_join_session_not_found(client: TestClient):
    """Test joining a non-existent session."""
    response = client.post(
        "/sessions/invalid-id/join",
        json={"userName": "User"},
    )
    assert response.status_code == 404


def test_update_code(client: TestClient):
    """Test updating code in a session."""
    # Create and join session
    create_response = client.post("/sessions", json={"hostName": "Host"})
    session_id = create_response.json()["sessionId"]
    session = client.get(f"/sessions/{session_id}").json()
    host_id = session["participants"][0]["id"]

    # Update code
    new_code = "console.log('updated');"
    response = client.patch(
        f"/sessions/{session_id}/code",
        json={"userId": host_id, "code": new_code, "language": "typescript"},
    )
    assert response.status_code == 204

    # Verify update
    session = client.get(f"/sessions/{session_id}").json()
    assert session["code"] == new_code
    assert session["language"] == "typescript"


def test_update_code_not_found(client: TestClient):
    """Test updating code in non-existent session."""
    response = client.patch(
        "/sessions/invalid-id/code",
        json={"userId": "user-id", "code": "code", "language": "javascript"},
    )
    assert response.status_code == 404


def test_leave_session(client: TestClient):
    """Test leaving a session."""
    # Create and join session
    create_response = client.post("/sessions", json={"hostName": "Host"})
    session_id = create_response.json()["sessionId"]

    join_response = client.post(
        f"/sessions/{session_id}/join",
        json={"userName": "Candidate"},
    )
    user_id = join_response.json()["userId"]

    # Leave session
    response = client.post(
        f"/sessions/{session_id}/leave",
        json={"userId": user_id},
    )
    assert response.status_code == 204

    # Verify user is gone
    session = client.get(f"/sessions/{session_id}").json()
    assert len(session["participants"]) == 1
    assert session["participants"][0]["name"] == "Host"


def test_leave_session_not_found(client: TestClient):
    """Test leaving non-existent session."""
    response = client.post(
        "/sessions/invalid-id/leave",
        json={"userId": "user-id"},
    )
    assert response.status_code == 404


def test_end_session(client: TestClient):
    """Test ending a session."""
    # Create session
    create_response = client.post("/sessions", json={"hostName": "Host"})
    session_id = create_response.json()["sessionId"]

    # End session
    response = client.post(f"/sessions/{session_id}/end")
    assert response.status_code == 204

    # Verify session is inactive
    session = client.get(f"/sessions/{session_id}").json()
    assert session["isActive"] is False


def test_end_session_not_found(client: TestClient):
    """Test ending non-existent session."""
    response = client.post("/sessions/invalid-id/end")
    assert response.status_code == 404


def test_default_code_javascript(client: TestClient):
    """Test getting default code for JavaScript."""
    response = client.get("/default-code?language=javascript")
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "javascript"
    assert "function solution" in data["code"]


def test_default_code_python(client: TestClient):
    """Test getting default code for Python."""
    response = client.get("/default-code?language=python")
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "python"
    assert "def solution" in data["code"]


def test_default_code_typescript(client: TestClient):
    """Test getting default code for TypeScript."""
    response = client.get("/default-code?language=typescript")
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "typescript"
    assert "function solution" in data["code"]


def test_default_code_invalid_language(client: TestClient):
    """Test getting default code for invalid language."""
    response = client.get("/default-code?language=invalid")
    assert response.status_code == 400
    assert "Unsupported language" in response.json()["detail"]


def test_health_check(client: TestClient):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
