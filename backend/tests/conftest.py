"""Fixtures for tests."""

import pytest
from fastapi.testclient import TestClient

# Reset database before each test
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import db, Database
from main import app


@pytest.fixture(autouse=True)
def reset_database():
    """Reset the database before each test."""
    # Clear all sessions
    db.sessions.clear()
    yield
    # Cleanup after test
    db.sessions.clear()


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)
