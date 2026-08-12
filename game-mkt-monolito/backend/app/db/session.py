from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import get_settings


settings = get_settings()

# Create engine
engine = create_engine(
    settings.database_url,
    echo=settings.database_echo,
    poolclass=NullPool,
    future=True
)

# Session factory
SessionLocal = sessionmaker(
    engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
