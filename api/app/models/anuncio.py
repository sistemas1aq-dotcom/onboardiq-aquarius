from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from .database import Base


class Anuncio(Base):
    __tablename__ = "anuncios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(300), nullable=False)
    contenido = Column(Text, nullable=False)
    tipo = Column(String(50), nullable=False)  # general, bienvenida, cesado, cumpleanos, festividad
    destinatarios = Column(String(50), default="todos")  # todos, activos, area
    fecha_publicacion = Column(DateTime, server_default=func.now())
    imagen_url = Column(String(500))
    activo = Column(Boolean, default=True)
    creado_por = Column(Integer, ForeignKey("usuarios.id"))
    fecha_creacion = Column(DateTime, server_default=func.now())
