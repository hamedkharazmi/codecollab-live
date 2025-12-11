"""Main FastAPI application."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import db
from app.executor import execute_code
from app.models import (
    CreateSessionRequest,
    CreateSessionResponse,
    JoinSessionRequest,
    JoinSessionResponse,
    UpdateCodeRequest,
    ExecuteCodeRequest,
    LeaveSessionRequest,
    DefaultCodeResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager."""
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="CodeCollab Interview API",
    description="API for collaborative coding interviews",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/sessions", response_model=CreateSessionResponse, status_code=201)
async def create_session(request: Request, body: CreateSessionRequest):
    """Create a new interview session."""
    base_url = f"{request.url.scheme}://{request.url.netloc}"
    session_id, share_link = db.create_session(body.hostName, base_url)
    return CreateSessionResponse(sessionId=session_id, shareLink=share_link)


@app.get("/sessions/{session_id}", status_code=200)
async def get_session(session_id: str):
    """Get session details."""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.post("/sessions/{session_id}/join", response_model=JoinSessionResponse)
async def join_session(session_id: str, body: JoinSessionRequest):
    """Join an existing session."""
    result = db.join_session(session_id, body.userName)
    if result is None:
        raise HTTPException(status_code=404, detail="Session not found")

    session, user_id = result
    return JoinSessionResponse(session=session, userId=user_id)


@app.patch("/sessions/{session_id}/code", status_code=204)
async def update_code(session_id: str, body: UpdateCodeRequest):
    """Update session code."""
    success = db.update_code(session_id, body.code, body.language)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")


@app.post("/sessions/{session_id}/execute")
async def execute_code_endpoint(session_id: str, body: ExecuteCodeRequest):
    """Execute code in a safe sandbox."""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    result = await execute_code(body.code, body.language)
    return result


@app.post("/sessions/{session_id}/leave", status_code=204)
async def leave_session(session_id: str, body: LeaveSessionRequest):
    """Leave a session."""
    success = db.leave_session(session_id, body.userId)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")


@app.post("/sessions/{session_id}/end", status_code=204)
async def end_session(session_id: str):
    """End a session (host only)."""
    success = db.end_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")


@app.get("/default-code", response_model=DefaultCodeResponse)
async def get_default_code(language: str):
    """Get default code template for a language."""
    valid_languages = ["javascript", "typescript", "python"]
    if language not in valid_languages:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Must be one of: {', '.join(valid_languages)}",
        )

    code = db.get_default_code(language)
    return DefaultCodeResponse(language=language, code=code)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
