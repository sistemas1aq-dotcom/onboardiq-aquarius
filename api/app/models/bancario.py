from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from .database import Base


class DatoBancario(Base):
    __tablename__ = "datos_bancarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trabajador_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    tiene_cuenta = Column(Boolean, default=False)
    entidad = Column(String(200))
    tipo_cuenta = Column(String(30))
    numero_cuenta = Column(String(30))
    cci = Column(String(30))
    fecha_actualizacion = Column(DateTime, server_default=func.now())
