from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from .database import Base


class Entrevista(Base):
    __tablename__ = "entrevistas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    postulante_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    tipo = Column(String(30), nullable=False)
    fecha = Column(Date, nullable=False)
    hora = Column(String(20), nullable=False)
    lugar = Column(String(200))
    evaluador_nombre = Column(String(200))
    duracion = Column(String(20))
    estado = Column(String(20), default="programada")
    notas = Column(String)

    postulante = relationship("Postulante", back_populates="entrevistas")
