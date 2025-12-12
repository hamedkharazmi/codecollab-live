# CodeCollab – Live Coding Interview Platform

A real-time collaborative coding interview platform that allows interviewers and candidates to write, execute, and debug code together in a shared session.

<video src="https://github.com/hamedkharazmi/codecollab-live/video.mp4" controls width="600"></video>

## Features

- **Real-time Code Collaboration**: Multiple users edit code simultaneously with live syntax highlighting
- **Multi-Language Support**: JavaScript, TypeScript, and Python with syntax highlighting and intellisense
- **Code Execution**: Safely execute code in a sandboxed environment with output streaming
- **Session Management**: Create/join interview sessions with unique share links
- **Participant Tracking**: See who's in the session and their activity
- **Persistent Storage**: PostgreSQL database for session history and audit logs

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Next-generation build tool
- **Monaco Editor** - VS Code's editor for syntax highlighting & intellisense
- **Tailwind CSS** + **shadcn/ui** - Modern UI components
- **TanStack Query** - Data synchronization

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy 2.0** - ORM for database abstraction
- **PostgreSQL** / **SQLite** - Relational database
- **Pydantic** - Data validation & serialization

### Deployment
- **Docker** & **Docker Compose** - Single container combining frontend + backend
- **Nginx** - Web server (development; baked into backend for production)

## Quick Start

### Prerequisites
- Docker & Docker Compose

### Run with Docker Compose

```bash
# Start all services (PostgreSQL, Backend+Frontend)
docker compose up -d --build

# Initialize the database
docker exec codecollab-app uv run python -c 'import app.orm_models; from app.db import init_db; init_db()'

# Access the app
# Frontend: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Health: http://localhost:8000/health
```

### Stop Services
```bash
docker compose down -v  # Remove volumes too
```

## Project Structure

```
.
├── Dockerfile              # Multi-stage: builds frontend, then backend
├── docker-compose.yml      # Services: postgres, app
├── openapi.yaml            # REST API specification
│
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # UI components (CodeEditor, etc.)
│   │   ├── pages/          # Interview and Session pages
│   │   └── services/       # HTTP client & API integration
│   └── package.json
│
└── backend/                # FastAPI Python application
    ├── main.py             # FastAPI app with 9 REST endpoints
    ├── app/
    │   ├── db.py           # SQLAlchemy session & engine
    │   ├── orm_models.py   # Session, SessionUser, CodeChange models
    │   ├── database.py     # CRUD service layer
    │   └── executor.py     # Safe code execution sandbox
    ├── tests/              # 21+ pytest unit tests
    └── pyproject.toml
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/sessions` | Create a new interview session |
| GET | `/sessions/{id}` | Get session details |
| POST | `/sessions/{id}/join` | Join an existing session |
| PATCH | `/sessions/{id}/code` | Update session code |
| POST | `/sessions/{id}/execute` | Execute code in session |
| POST | `/sessions/{id}/leave` | Leave a session |
| POST | `/sessions/{id}/end` | End session (host only) |
| GET | `/default-code` | Get code template for language |
| GET | `/health` | Health check |

## Development

### Local Setup (without Docker)

```bash
# Backend
cd backend
uv sync
uv run python main.py  # http://localhost:8000

# Frontend (in another terminal)
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### Run Tests

```bash
cd backend
uv run pytest tests/ -v
```

## Environment Variables

Create `.env.docker` (or `.env` for local development):

```env
POSTGRES_DB=codecollab
POSTGRES_USER=codecollab
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://codecollab:password@postgres:5432/codecollab
```

## License

MIT

## Author

CodeCollab Team
