from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base


class Configuracion(Base):
    __tablename__ = "configuracion"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    clave = Column(String(100), unique=True, nullable=False)
    valor = Column(String)
    descripcion = Column(String(300))
    fecha_actualizacion = Column(DateTime, server_default=func.now())
