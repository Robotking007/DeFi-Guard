from datetime import datetime
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """System health check response."""
    status: str = Field(..., json_schema_extra={"example": "healthy"})
    version: str = Field(..., json_schema_extra={"example": "1.0.0"})
    environment: str = Field(..., json_schema_extra={"example": "development"})
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    database_connected: bool = Field(..., json_schema_extra={"example": True})
