"""Data models for the CodeCollab API."""

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


SupportedLanguage = Literal["javascript", "typescript", "python"]


class User(BaseModel):
    """User in a session."""

    id: str
    name: str
    isHost: bool
    joinedAt: datetime


class CodeChange(BaseModel):
    """Code change event."""

    userId: str
    content: str
    timestamp: datetime
    language: SupportedLanguage


class InterviewSession(BaseModel):
    """Interview session state."""

    id: str
    code: str
    language: SupportedLanguage
    participants: list[User]
    createdAt: datetime
    isActive: bool


class ExecutionResult(BaseModel):
    """Result of code execution."""

    success: bool
    output: str
    error: str | None = None
    executionTime: float


class CreateSessionRequest(BaseModel):
    """Request to create a session."""

    hostName: str


class CreateSessionResponse(BaseModel):
    """Response when creating a session."""

    sessionId: str
    shareLink: str


class JoinSessionRequest(BaseModel):
    """Request to join a session."""

    userName: str


class JoinSessionResponse(BaseModel):
    """Response when joining a session."""

    session: InterviewSession
    userId: str


class UpdateCodeRequest(BaseModel):
    """Request to update code."""

    userId: str
    code: str
    language: SupportedLanguage


class ExecuteCodeRequest(BaseModel):
    """Request to execute code."""

    code: str
    language: SupportedLanguage


class LeaveSessionRequest(BaseModel):
    """Request to leave a session."""

    userId: str


class DefaultCodeResponse(BaseModel):
    """Response with default code template."""

    language: SupportedLanguage
    code: str
