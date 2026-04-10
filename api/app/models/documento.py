from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    postulante_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    tipo = Column(String(100), nullable=False)
    nombre_archivo = Column(String(300))
    url = Column(String(500))
    estado = Column(String(20), default="pending")  # ok, pending, na, rechazado
    requerido = Column(Boolean, default=True)
    observacion = Column(String(300))
    fecha_subida = Column(DateTime)
    fecha_revision = Column(DateTime)

    postulante = relationship("Postulante", back_populates="documentos")
