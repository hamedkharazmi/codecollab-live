# Multi-stage build: build frontend, then backend (serve static files from FastAPI)

# Frontend build stage
FROM node:20-alpine AS frontend-builder
WORKDIR /src/frontend

# Install deps and build
COPY frontend/package.json frontend/bun.lockb ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Backend build stage
FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy python project files
COPY backend/pyproject.toml backend/uv.lock* ./

# Install uv tool
RUN pip install --no-cache-dir uv

# Install Python dependencies
RUN uv sync --frozen --no-editable

# Copy backend source
COPY backend/ .

# Copy built frontend into static folder for serving
COPY --from=frontend-builder /src/frontend/dist ./static

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start uvicorn
CMD ["uv", "run", "python", "main.py"]
