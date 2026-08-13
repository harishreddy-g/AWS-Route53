from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Backend foundation for the Route53 clone application.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    """Initialize the SQLite database when the application starts."""
    init_db()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
