from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from .database import Base


class RegimenPensionario(Base):
    __tablename__ = "regimen_pensionario"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trabajador_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    tipo = Column(String(10), nullable=False)  # afp, onp
    entidad = Column(String(100))
    cuspp = Column(String(30))
    primer_trabajo = Column(Boolean, default=False)
    fecha_actualizacion = Column(DateTime, server_default=func.now())
