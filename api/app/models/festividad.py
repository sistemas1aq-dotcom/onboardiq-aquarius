from sqlalchemy import Column, Integer, String, Boolean, Text
from .database import Base


class Festividad(Base):
    __tablename__ = "festividades"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    fecha = Column(String(5), nullable=False)  # Formato MM-DD
    mensaje = Column(Text)
    activa = Column(Boolean, default=True)
