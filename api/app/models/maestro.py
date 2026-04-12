from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class MaestroArea(Base):
    __tablename__ = "maestro_areas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(String(300))
    activa = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())

    cargos = relationship("MaestroCargo", back_populates="area")


class MaestroCargo(Base):
    __tablename__ = "maestro_cargos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)
    area_id = Column(Integer, ForeignKey("maestro_areas.id"), nullable=False)
    descripcion = Column(String(300))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())

    area = relationship("MaestroArea", back_populates="cargos")
