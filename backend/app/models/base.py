import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.core.database import Base


def generate_uuid() -> str:
    """Generate string UUID representation."""
    return str(uuid.uuid4())


class TimestampMixin:
    """Mixin for models requiring created_at timestamps."""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class UUIDPrimaryKeyMixin:
    """Mixin providing string-based UUID primary keys compatible with PostgreSQL and SQLite."""
    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
