from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from .database import Base


class ChatConversacion(Base):
    __tablename__ = "chat_conversaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(200))
    tipo = Column(String(20), default="directo")  # directo, grupo
    creado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now())


class ChatParticipante(Base):
    __tablename__ = "chat_participantes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversacion_id = Column(Integer, ForeignKey("chat_conversaciones.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha_union = Column(DateTime, server_default=func.now())


class ChatMensaje(Base):
    __tablename__ = "chat_mensajes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversacion_id = Column(Integer, ForeignKey("chat_conversaciones.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    contenido = Column(Text)
    tipo_mensaje = Column(String(20), default="texto")  # texto, imagen, documento, archivo
    archivo_url = Column(Text)
    archivo_nombre = Column(String(500))
    archivo_tamano = Column(Integer)
    fecha_envio = Column(DateTime, server_default=func.now())
    leido = Column(Boolean, default=False)
