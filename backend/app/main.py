from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, check_db_connection
from app.schemas.health import HealthResponse

from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.wallets import router as wallets_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.risk import router as risk_router
from app.api.v1.lending import router as lending_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.compliance import router as compliance_router
from app.api.v1.swap import router as swap_router
from app.api.v1.security import router as security_router
from app.api.v1.governance import router as governance_router

# Initialize all database tables for local dev
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "DeFiGuard API: Intelligent Decentralized Finance, Risk Assessment "
        "and Regulatory Compliance Platform"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Top-level health endpoints
@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint welcoming clients to DeFiGuard API."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Top-level health check."""
    db_ok = check_db_connection()
    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        version=settings.VERSION,
        environment=settings.APP_ENV,
        database_connected=db_ok,
    )


# Include API routers under both /api/v1 and /api for seamless frontend client compatibility
for prefix in [settings.API_V1_PREFIX, "/api"]:
    app.include_router(health_router, prefix=prefix)
    app.include_router(auth_router, prefix=prefix)
    app.include_router(users_router, prefix=prefix)
    app.include_router(wallets_router, prefix=prefix)
    app.include_router(transactions_router, prefix=prefix)
    app.include_router(risk_router, prefix=prefix)
    app.include_router(lending_router, prefix=prefix)
    app.include_router(analytics_router, prefix=prefix)
    app.include_router(compliance_router, prefix=prefix)
    app.include_router(swap_router, prefix=prefix)
    app.include_router(security_router, prefix=prefix)
    app.include_router(governance_router, prefix=prefix)
