from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.exceptions import AppError, ConflictError, NotFoundError, UnauthorizedError, ValidationError
from app.routers.auth import router as auth_router
from app.routers.cidr_collections import router as cidr_collections_router
from app.routers.dns_records import router as dns_records_router
from app.routers.health_checks import router as health_checks_router
from app.routers.hosted_zones import router as hosted_zones_router
from app.routers.registered_domains import router as registered_domains_router
from app.routers.traffic_policies import router as traffic_policies_router
from app.routers.vpcs import router as vpcs_router
from app.seed import seed_default_user


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    seed_default_user()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Backend foundation for the Route53 clone application.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(NotFoundError)
async def not_found_handler(_: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.exception_handler(ConflictError)
async def conflict_handler(_: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": exc.message})


@app.exception_handler(ValidationError)
async def validation_handler(_: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(UnauthorizedError)
async def unauthorized_handler(_: Request, exc: UnauthorizedError) -> JSONResponse:
    return JSONResponse(status_code=401, content={"detail": exc.message})


app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(hosted_zones_router, prefix=settings.api_v1_prefix)
app.include_router(dns_records_router, prefix=settings.api_v1_prefix)
app.include_router(health_checks_router, prefix=settings.api_v1_prefix)
app.include_router(traffic_policies_router, prefix=settings.api_v1_prefix)
app.include_router(cidr_collections_router, prefix=settings.api_v1_prefix)
app.include_router(registered_domains_router, prefix=settings.api_v1_prefix)
app.include_router(vpcs_router, prefix=settings.api_v1_prefix)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
