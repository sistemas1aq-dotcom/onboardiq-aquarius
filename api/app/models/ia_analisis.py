from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from .database import Base


class IAAnalisis(Base):
    __tablename__ = "ia_analisis"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    postulante_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    tipo = Column(String(50), nullable=False)  # cv_analysis, scoring, insights
    resultado = Column(String)  # JSON
    score = Column(Integer)
    fecha = Column(DateTime, server_default=func.now())
