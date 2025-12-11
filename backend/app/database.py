"""Mock in-memory database for sessions."""

import uuid
from datetime import datetime
from typing import Optional

from .models import InterviewSession, User, SupportedLanguage


# Default code templates
DEFAULT_CODE = {
    "javascript": """// Welcome to the coding interview!
// Write your solution below

function solution(input) {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
""",
    "typescript": """// Welcome to the coding interview!
// Write your solution below

function solution(input: string): string {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
""",
    "python": """# Welcome to the coding interview!
# Write your solution below

def solution(input):
    # Your code here
    return input

# Test your solution
print(solution("Hello, World!"))
""",
}


class Database:
    """Mock in-memory database (will be replaced with real DB later)."""

    def __init__(self):
        self.sessions: dict[str, InterviewSession] = {}

    def create_session(self, host_name: str, base_url: str) -> tuple[str, str]:
        """Create a new session.

        Args:
            host_name: Name of the session host
            base_url: Base URL for generating share link

        Returns:
            Tuple of (session_id, share_link)
        """
        session_id = str(uuid.uuid4())[:8]

        host_user = User(
            id=str(uuid.uuid4()),
            name=host_name,
            isHost=True,
            joinedAt=datetime.now(),
        )

        session = InterviewSession(
            id=session_id,
            code=DEFAULT_CODE["javascript"],
            language="javascript",
            participants=[host_user],
            createdAt=datetime.now(),
            isActive=True,
        )

        self.sessions[session_id] = session
        share_link = f"{base_url}/interview/{session_id}"

        return session_id, share_link

    def get_session(self, session_id: str) -> Optional[InterviewSession]:
        """Get session by ID."""
        return self.sessions.get(session_id)

    def join_session(self, session_id: str, user_name: str) -> Optional[tuple[InterviewSession, str]]:
        """Join a session.

        Args:
            session_id: Session to join
            user_name: Name of the user joining

        Returns:
            Tuple of (session, user_id) or None if session not found
        """
        session = self.sessions.get(session_id)
        if not session or not session.isActive:
            return None

        new_user = User(
            id=str(uuid.uuid4()),
            name=user_name,
            isHost=False,
            joinedAt=datetime.now(),
        )

        session.participants.append(new_user)
        return session, new_user.id

    def update_code(self, session_id: str, code: str, language: SupportedLanguage) -> bool:
        """Update code in a session."""
        session = self.sessions.get(session_id)
        if not session:
            return False

        session.code = code
        session.language = language
        return True

    def leave_session(self, session_id: str, user_id: str) -> bool:
        """Remove a user from a session."""
        session = self.sessions.get(session_id)
        if not session:
            return False

        session.participants = [p for p in session.participants if p.id != user_id]
        return True

    def end_session(self, session_id: str) -> bool:
        """End a session (mark as inactive)."""
        session = self.sessions.get(session_id)
        if not session:
            return False

        session.isActive = False
        return True

    def get_default_code(self, language: SupportedLanguage) -> str:
        """Get default code template for a language."""
        return DEFAULT_CODE.get(language, DEFAULT_CODE["javascript"])


# Global database instance
db = Database()
