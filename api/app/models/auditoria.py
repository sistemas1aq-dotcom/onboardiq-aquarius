from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from .database import Base


class Auditoria(Base):
    __tablename__ = "auditoria"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    accion = Column(String(100), nullable=False)
    detalle = Column(String)
    ip_address = Column(String(50))
    fecha = Column(DateTime, server_default=func.now())
