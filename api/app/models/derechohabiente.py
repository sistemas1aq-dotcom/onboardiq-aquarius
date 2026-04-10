from sqlalchemy import Column, Integer, String, ForeignKey, Date
from .database import Base


class Derechohabiente(Base):
    __tablename__ = "derechohabientes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trabajador_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    nombre_completo = Column(String(200), nullable=False)
    parentesco = Column(String(50), nullable=False)
    dni = Column(String(20))
    fecha_nacimiento = Column(Date)
    genero = Column(String(20))
    telefono = Column(String(20))
