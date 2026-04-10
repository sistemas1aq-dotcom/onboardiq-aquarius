from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from ..config import get_settings

settings = get_settings()

# Convertir postgresql:// a postgresql+pg8000:// para usar driver pg8000
_db_url = settings.database_url
if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+pg8000://", 1)

# Remover parametros no soportados por pg8000
_db_url = _db_url.replace("?sslmode=require&channel_binding=require", "")
_db_url = _db_url.replace("?sslmode=require", "")
_db_url = _db_url.replace("&sslmode=require", "")
_db_url = _db_url.replace("&channel_binding=require", "")

# pg8000 usa ssl via connect_args
_connect_args = {}
_orig_url = settings.database_url
if "neon.tech" in _orig_url or "neon" in _orig_url:
    import ssl
    ssl_context = ssl.create_default_context()
    _connect_args = {"ssl_context": ssl_context}

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
