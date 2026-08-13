from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers.auth import router as auth_router
from app.routers.dns_records import router as dns_records_router
from app.routers.hosted_zones import router as hosted_zones_router
from app.seed import seed_default_user

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

app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(hosted_zones_router, prefix=settings.api_v1_prefix)
app.include_router(dns_records_router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
def startup_event() -> None:
    """Initialize the SQLite database and seed the mock user on startup."""
    init_db()
    seed_default_user()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
