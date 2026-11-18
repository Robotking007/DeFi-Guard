from fastapi import APIRouter
from app.schemas.health import HealthResponse
from app.core.config import settings
from app.core.database import check_db_connection

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def get_health() -> HealthResponse:
    """Return API health status, version, and database connectivity."""
    db_ok = check_db_connection()
    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        version=settings.VERSION,
        environment=settings.APP_ENV,
        database_connected=db_ok,
    )
