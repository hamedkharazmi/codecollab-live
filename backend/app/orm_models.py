"""ORM models for sessions and users."""
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .db import Base


class SessionUser(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    isHost = Column(Boolean, default=False)
    joinedAt = Column(DateTime, default=datetime.utcnow)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "isHost": self.isHost,
            "joinedAt": self.joinedAt,
        }


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4())[:8])
    code = Column(Text, nullable=False)
    language = Column(String(32), nullable=False, default="javascript")
    createdAt = Column(DateTime, default=datetime.utcnow)
    isActive = Column(Boolean, default=True)

    participants = relationship("SessionUser", backref="session", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "language": self.language,
            "participants": [p.to_dict() for p in self.participants],
            "createdAt": self.createdAt,
            "isActive": self.isActive,
        }


class CodeChange(Base):
    __tablename__ = "code_changes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False, index=True)
    userId = Column(String(36), nullable=False, index=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    language = Column(String(32), nullable=False)
