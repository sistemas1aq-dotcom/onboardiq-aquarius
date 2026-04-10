from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime
from sqlalchemy.sql import func
from .database import Base


class Capacitacion(Base):
    __tablename__ = "capacitaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(String)
    fecha_limite = Column(Date)
    obligatoria = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())


class CapacitacionTrabajador(Base):
    __tablename__ = "capacitacion_trabajador"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    capacitacion_id = Column(Integer, ForeignKey("capacitaciones.id"), nullable=False)
    trabajador_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    cumplimiento = Column(Integer, default=0)
    fecha_completado = Column(DateTime)
    certificado_url = Column(String(500))
