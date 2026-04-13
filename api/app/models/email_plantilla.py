from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.sql import func
from .database import Base


class EmailPlantilla(Base):
    __tablename__ = "email_plantillas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo = Column(String(50), unique=True, nullable=False)  # credenciales, bienvenida, cesado, cumpleanos, festividad, anuncio
    asunto = Column(String(300), nullable=False)
    contenido = Column(Text, nullable=False)
    variables_disponibles = Column(Text, nullable=True)  # comma separated: {nombre},{puesto},{email},{password}
    activa = Column(Boolean, default=True)
    fecha_actualizacion = Column(DateTime, server_default=func.now(), onupdate=func.now())
