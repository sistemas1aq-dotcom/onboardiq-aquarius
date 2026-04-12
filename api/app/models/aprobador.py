from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class AprobadorPostulante(Base):
    __tablename__ = "aprobadores_postulante"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    postulante_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    orden = Column(Integer, nullable=False)
    estado = Column(String(20), default="pendiente")
    comentario = Column(Text, nullable=True)
    fecha_accion = Column(DateTime, nullable=True)

    postulante = relationship("Postulante")
    usuario = relationship("Usuario")
