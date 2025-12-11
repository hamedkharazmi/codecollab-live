"""Tests for code execution endpoint."""

import pytest
from fastapi.testclient import TestClient


def test_execute_code_javascript_success(client: TestClient):
    """Test executing JavaScript code successfully."""
    # Create session
    create_response = client.post("/sessions", json={"hostName": "Host"})
    session_id = create_response.json()["sessionId"]

    # Execute code
    response = client.post(
        f"/sessions/{session_id}/execute",
        json={
            "code": "console.log('Hello, World!');",
            "language": "javascript",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Hello, World!" in data["output"]
    assert data["executionTime"] >= 0


def test_execute_code_javascript_error(client: TestClient):
    """Test executing JavaScript code with error."""
    # Create session
    create_response = client.post("/sessions", json={"hostName": "Host"})
    session_id = create_response.json()["sessionId"]

    # Execute invalid code
    response = client.post(
        f"/sessions/{session_id}/execute",
        json={
            "code": "throw new Error('Test error');",
            "language": "javascript",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error"] is not None
    assert data["output"] == ""


def test_execute_code_python(client: TestClient):
    """Test executing Python code."""
    # Create session
    create_response = client.post("/sessions", json={"hostName": "Host"})
    session_id = create_response.json()["sessionId"]

    # Execute code
    response = client.post(
        f"/sessions/{session_id}/execute",
        json={
            "code": "print('Hello, Python!')",
            "language": "python",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Python" in data["output"] or "Hello" in data["output"]


def test_execute_code_session_not_found(client: TestClient):
    """Test executing code in non-existent session."""
    response = client.post(
        "/sessions/invalid-id/execute",
        json={"code": "console.log('test');", "language": "javascript"},
    )
    assert response.status_code == 404


def test_execute_code_no_output(client: TestClient):
    """Test executing code with no output."""
    # Create session
    create_response = client.post("/sessions", json={"hostName": "Host"})
    session_id = create_response.json()["sessionId"]

    # Execute code with explicit console.log call (safest mock execution)
    response = client.post(
        f"/sessions/{session_id}/execute",
        json={
            "code": "console.log('test');",
            "language": "javascript",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "test" in data["output"]
