"""Fixtures for tests."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import os
import tempfile

# Reset database before each test
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set TESTING flag before importing app
os.environ["TESTING"] = "1"

from app.db import Base, get_db
from main import app


# Create temp directory for test database
TEST_DB_DIR = tempfile.mkdtemp()


@pytest.fixture(scope="session")
def test_engine():
    """Create a test database engine for the session."""
    test_db_path = os.path.join(TEST_DB_DIR, "test.db")
    engine = create_engine(
        f"sqlite:///{test_db_path}",
        connect_args={"check_same_thread": False},
        echo=False,
        future=True,
    )
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    # Cleanup
    engine.dispose()


@pytest.fixture(scope="function")
def test_db(test_engine):
    """Create a test database and return a session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    
    # Create session
    db = TestingSessionLocal()
    
    yield db
    
    # Cleanup: delete all rows from all tables
    db.rollback()
    try:
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(text(f"DELETE FROM {table.name}"))
        db.commit()
    except:
        db.rollback()
    finally:
        db.close()


@pytest.fixture
def client(test_db: Session):
    """Create a test client with overridden database dependency."""
    def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()
