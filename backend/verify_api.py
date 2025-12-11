#!/usr/bin/env python
"""Verification script to test all running backend endpoints.

Run this script with the backend server running:
    uv run python verify_api.py
"""

import sys
import httpx
from typing import Any


BASE_URL = "http://localhost:8000"
client = httpx.Client(base_url=BASE_URL, timeout=5.0)

# Color codes for output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BOLD = "\033[1m"
RESET = "\033[0m"

passed = 0
failed = 0


def print_test(name: str):
    """Print test name."""
    print(f"\n{BOLD}▶ {name}{RESET}")


def print_pass(message: str = "✓ Passed"):
    """Print passing test."""
    global passed
    passed += 1
    print(f"{GREEN}  {message}{RESET}")


def print_fail(message: str = "✗ Failed"):
    """Print failing test."""
    global failed
    failed += 1
    print(f"{RED}  {message}{RESET}")


def assert_status(response: httpx.Response, expected: int, message: str = ""):
    """Assert response status code."""
    if response.status_code == expected:
        print_pass(f"Status {response.status_code} {message}")
        return True
    else:
        print_fail(f"Expected {expected}, got {response.status_code} {message}")
        print(f"  Response: {response.text[:200]}")
        return False


def assert_json_key(data: dict, key: str, message: str = ""):
    """Assert JSON response contains key."""
    if key in data:
        print_pass(f"Key '{key}' found {message}")
        return True
    else:
        print_fail(f"Key '{key}' not found {message}")
        return False


def test_health():
    """Test health check endpoint."""
    print_test("GET /health")
    response = client.get("/health")
    assert_status(response, 200)
    data = response.json()
    assert_json_key(data, "status")
    if data.get("status") == "ok":
        print_pass("Status is 'ok'")


def test_create_session():
    """Test creating a session."""
    print_test("POST /sessions - Create session")
    response = client.post("/sessions", json={"hostName": "Alice"})
    assert_status(response, 201)
    data = response.json()
    assert_json_key(data, "sessionId")
    assert_json_key(data, "shareLink")
    if "sessionId" in data and "shareLink" in data:
        print_pass(f"Session ID: {data['sessionId']}")
        return data["sessionId"]
    return None


def test_get_session(session_id: str):
    """Test getting session details."""
    print_test(f"GET /sessions/{session_id} - Get session")
    response = client.get(f"/sessions/{session_id}")
    assert_status(response, 200)
    data = response.json()
    assert_json_key(data, "id")
    assert_json_key(data, "code")
    assert_json_key(data, "language")
    assert_json_key(data, "participants")
    assert_json_key(data, "isActive")
    if data.get("language") == "javascript":
        print_pass("Default language is JavaScript")
    if len(data.get("participants", [])) == 1:
        print_pass("Host is only participant")


def test_get_nonexistent_session():
    """Test getting a non-existent session."""
    print_test("GET /sessions/invalid-id - Session not found")
    response = client.get("/sessions/invalid-id")
    assert_status(response, 404)


def test_join_session(session_id: str):
    """Test joining a session."""
    print_test(f"POST /sessions/{session_id}/join - Join session")
    response = client.post(f"/sessions/{session_id}/join", json={"userName": "Bob"})
    assert_status(response, 200)
    data = response.json()
    assert_json_key(data, "session")
    assert_json_key(data, "userId")
    if "userId" in data:
        print_pass(f"User ID: {data['userId']}")
    session = data.get("session", {})
    if len(session.get("participants", [])) == 2:
        print_pass("Now 2 participants in session")
    return data.get("userId")


def test_update_code(session_id: str):
    """Test updating code."""
    print_test(f"PATCH /sessions/{session_id}/code - Update code")
    # Get the host user ID first
    session_response = client.get(f"/sessions/{session_id}")
    host_id = session_response.json()["participants"][0]["id"]

    response = client.patch(
        f"/sessions/{session_id}/code",
        json={
            "userId": host_id,
            "code": "console.log('Hello from backend!');",
            "language": "typescript",
        },
    )
    assert_status(response, 204)

    # Verify the update
    session_response = client.get(f"/sessions/{session_id}")
    data = session_response.json()
    if data.get("language") == "typescript":
        print_pass("Language updated to TypeScript")
    if "Hello from backend" in data.get("code", ""):
        print_pass("Code updated correctly")


def test_execute_code(session_id: str):
    """Test executing code."""
    print_test(f"POST /sessions/{session_id}/execute - Execute JavaScript")
    response = client.post(
        f"/sessions/{session_id}/execute",
        json={
            "code": "console.log('Test execution');",
            "language": "javascript",
        },
    )
    assert_status(response, 200)
    data = response.json()
    assert_json_key(data, "success")
    assert_json_key(data, "output")
    assert_json_key(data, "executionTime")
    if data.get("success"):
        print_pass("Execution successful")
    if "Test execution" in data.get("output", ""):
        print_pass(f"Output captured: {data['output'][:100]}")


def test_execute_python(session_id: str):
    """Test executing Python code."""
    print_test(f"POST /sessions/{session_id}/execute - Execute Python")
    response = client.post(
        f"/sessions/{session_id}/execute",
        json={
            "code": "print('Hello, Python!')",
            "language": "python",
        },
    )
    assert_status(response, 200)
    data = response.json()
    if data.get("success"):
        print_pass("Python execution successful")
    if "Python" in data.get("output", ""):
        print_pass(f"Output: {data['output'][:100]}")


def test_execute_code_error(session_id: str):
    """Test executing code with error."""
    print_test(f"POST /sessions/{session_id}/execute - Error handling")
    response = client.post(
        f"/sessions/{session_id}/execute",
        json={
            "code": "throw new Error('Test error');",
            "language": "javascript",
        },
    )
    assert_status(response, 200)
    data = response.json()
    if not data.get("success"):
        print_pass("Error detected correctly")
    if data.get("error"):
        print_pass(f"Error message: {data['error'][:100]}")


def test_default_code():
    """Test getting default code templates."""
    languages = ["javascript", "typescript", "python"]
    for lang in languages:
        print_test(f"GET /default-code?language={lang}")
        response = client.get(f"/default-code?language={lang}")
        assert_status(response, 200)
        data = response.json()
        assert_json_key(data, "language")
        assert_json_key(data, "code")
        if len(data.get("code", "")) > 0:
            print_pass(f"Template length: {len(data['code'])} chars")


def test_default_code_invalid():
    """Test invalid language."""
    print_test("GET /default-code?language=rust - Invalid language")
    response = client.get("/default-code?language=rust")
    assert_status(response, 400)


def test_leave_session(session_id: str, user_id: str):
    """Test leaving a session."""
    print_test(f"POST /sessions/{session_id}/leave - Leave session")
    response = client.post(f"/sessions/{session_id}/leave", json={"userId": user_id})
    assert_status(response, 204)

    # Verify participant was removed
    session_response = client.get(f"/sessions/{session_id}")
    data = session_response.json()
    if len(data.get("participants", [])) == 1:
        print_pass("Participant removed (1 left)")


def test_end_session(session_id: str):
    """Test ending a session."""
    print_test(f"POST /sessions/{session_id}/end - End session")
    response = client.post(f"/sessions/{session_id}/end")
    assert_status(response, 204)

    # Verify session is inactive
    session_response = client.get(f"/sessions/{session_id}")
    data = session_response.json()
    if not data.get("isActive"):
        print_pass("Session marked as inactive")


def main():
    """Run all tests."""
    print(f"\n{BOLD}🧪 CodeCollab Backend API Verification{RESET}")
    print(f"{YELLOW}Testing: {BASE_URL}{RESET}\n")

    try:
        # Health check
        test_health()

        # Session lifecycle
        session_id = test_create_session()
        if not session_id:
            print(f"{RED}Cannot continue without session ID{RESET}")
            return False

        test_get_session(session_id)
        test_get_nonexistent_session()

        # Join and collaborate
        user_id = test_join_session(session_id)
        test_update_code(session_id)

        # Code execution
        test_execute_code(session_id)
        test_execute_python(session_id)
        test_execute_code_error(session_id)

        # Default code
        test_default_code()
        test_default_code_invalid()

        # Clean up
        if user_id:
            test_leave_session(session_id, user_id)
        test_end_session(session_id)

        # Summary
        total = passed + failed
        print(f"\n{BOLD}📊 Results{RESET}")
        print(f"  {GREEN}Passed: {passed}{RESET}")
        print(f"  {RED}Failed: {failed}{RESET}")
        print(f"  Total:  {total}\n")

        if failed == 0:
            print(f"{GREEN}{BOLD}✅ All tests passed!{RESET}\n")
            return True
        else:
            print(f"{RED}{BOLD}❌ Some tests failed.{RESET}\n")
            return False

    except httpx.ConnectError:
        print(
            f"\n{RED}❌ Cannot connect to {BASE_URL}{RESET}"
        )
        print("Make sure the backend is running:")
        print(f"  {YELLOW}cd backend && uv run python main.py{RESET}\n")
        return False
    except Exception as e:
        print(f"\n{RED}❌ Error: {str(e)}{RESET}\n")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
