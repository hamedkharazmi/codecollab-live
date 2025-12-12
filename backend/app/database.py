"""SQL-backed repository using SQLAlchemy."""

from datetime import datetime
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from .orm_models import Session as ORMSession, SessionUser, CodeChange
from .models import SupportedLanguage
import uuid


# Default code templates with syntax highlighting examples
DEFAULT_CODE = {
    "javascript": """// Welcome to the coding interview!
// Write your solution below

function solution(input) {
  // Example: Find the sum of all numbers in an array
  if (!Array.isArray(input)) {
    return 0;
  }
  
  return input.reduce((sum, num) => {
    return sum + (typeof num === 'number' ? num : 0);
  }, 0);
}

// Test your solution
console.log(solution([1, 2, 3, 4, 5])); // Output: 15
console.log(solution("Hello, World!"));
""",
    "typescript": """// Welcome to the coding interview!
// Write your solution below

interface InputData {
  values: number[];
  operation: 'sum' | 'product' | 'average';
}

function solution(data: InputData): number {
  const { values, operation } = data;
  
  if (!values.length) return 0;
  
  switch (operation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'product':
      return values.reduce((a, b) => a * b, 1);
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

// Test your solution
console.log(solution({ values: [1, 2, 3, 4, 5], operation: 'sum' }));
""",
    "python": """# Welcome to the coding interview!
# Write your solution below

from typing import List, Union

def solution(input_data: Union[List[int], str]) -> int:
    """
    Calculate the sum of all numbers in a list.
    
    Args:
        input_data: A list of integers or a string
        
    Returns:
        The sum of all numbers, or 0 if input is invalid
    """
    if not isinstance(input_data, list):
        return 0
    
    total = 0
    for num in input_data:
        if isinstance(num, (int, float)):
            total += num
    
    return total

# Test your solution
result1 = solution([1, 2, 3, 4, 5])
print(f"Sum of [1, 2, 3, 4, 5]: {result1}")  # Output: 15

result2 = solution([10, 20, 30])
print(f"Sum of [10, 20, 30]: {result2}")  # Output: 60

result3 = solution("Hello, World!")
print(f"Sum of 'Hello, World!': {result3}")  # Output: 0
""",
}


class DatabaseService:
    """Repository backed by SQLAlchemy."""

    def __init__(self, db: Session):
        self.db = db

    def create_session(self, host_name: str, base_url: str) -> Tuple[str, str]:
        """Create a new session."""
        session_id = str(uuid.uuid4())[:8]
        
        orm_session = ORMSession(id=session_id, code=DEFAULT_CODE["javascript"], language="javascript")
        self.db.add(orm_session)
        self.db.flush()

        host_user = SessionUser(
            id=str(uuid.uuid4()),
            name=host_name,
            isHost=True,
            joinedAt=datetime.utcnow(),
            session_id=orm_session.id,
        )
        self.db.add(host_user)
        self.db.commit()

        share_link = f"{base_url}/interview/{orm_session.id}"
        return orm_session.id, share_link

    def get_session(self, session_id: str) -> Optional[dict]:
        """Get session by ID."""
        orm = self.db.query(ORMSession).filter(ORMSession.id == session_id).first()
        if not orm:
            return None

        return {
            "id": orm.id,
            "code": orm.code,
            "language": orm.language,
            "participants": [
                {"id": p.id, "name": p.name, "isHost": p.isHost, "joinedAt": p.joinedAt}
                for p in orm.participants
            ],
            "createdAt": orm.createdAt,
            "isActive": orm.isActive,
        }

    def join_session(self, session_id: str, user_name: str) -> Optional[Tuple[dict, str]]:
        """Join a session."""
        orm = (
            self.db.query(ORMSession)
            .filter(ORMSession.id == session_id, ORMSession.isActive == True)
            .first()
        )
        if not orm:
            return None

        new_user = SessionUser(
            id=str(uuid.uuid4()),
            name=user_name,
            isHost=False,
            joinedAt=datetime.utcnow(),
            session_id=orm.id,
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(orm)

        session_dict = {
            "id": orm.id,
            "code": orm.code,
            "language": orm.language,
            "participants": [
                {"id": p.id, "name": p.name, "isHost": p.isHost, "joinedAt": p.joinedAt}
                for p in orm.participants
            ],
            "createdAt": orm.createdAt,
            "isActive": orm.isActive,
        }
        return session_dict, new_user.id

    def update_code(self, session_id: str, code: str, language: SupportedLanguage) -> bool:
        """Update code in a session."""
        orm = self.db.query(ORMSession).filter(ORMSession.id == session_id).first()
        if not orm:
            return False

        orm.code = code
        orm.language = language
        self.db.commit()

        # Log change for audit trail
        change = CodeChange(
            session_id=session_id,
            userId="system",
            content=code,
            language=language,
            timestamp=datetime.utcnow(),
        )
        self.db.add(change)
        self.db.commit()
        return True

    def leave_session(self, session_id: str, user_id: str) -> bool:
        """Remove a user from a session."""
        user = self.db.query(SessionUser).filter(
            SessionUser.id == user_id, SessionUser.session_id == session_id
        ).first()
        if not user:
            return False

        self.db.delete(user)
        self.db.commit()
        return True

    def end_session(self, session_id: str) -> bool:
        """End a session."""
        orm = self.db.query(ORMSession).filter(ORMSession.id == session_id).first()
        if not orm:
            return False

        orm.isActive = False
        self.db.commit()
        return True

    def get_default_code(self, language: SupportedLanguage) -> str:
        """Get default code template."""
        return DEFAULT_CODE.get(language, DEFAULT_CODE["javascript"])

    def get_default_code(self, language: SupportedLanguage) -> str:
        return DEFAULT_CODE.get(language, DEFAULT_CODE["javascript"])

