from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from .database import Base


class FirmaDigital(Base):
    __tablename__ = "firmas_digitales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo_documento = Column(String(100), nullable=False)
    firma_data = Column(String, nullable=False)  # base64
    ip_address = Column(String(50))
    hash_documento = Column(String(128))
    fecha_firma = Column(DateTime, server_default=func.now())
