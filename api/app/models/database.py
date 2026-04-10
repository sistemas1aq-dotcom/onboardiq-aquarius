from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from ..config import get_settings

settings = get_settings()

# Determinar si estamos conectando a Neon (requiere SSL) o local
_db_url = settings.database_url
_connect_args = {}
if _db_url and ("neon.tech" in _db_url or "neon" in _db_url):
    _connect_args = {"sslmode": "require"}

engine = create_engine(
    _db_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args=_connect_args,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
