from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from .database import Base


class ComunicacionLog(Base):
    __tablename__ = "comunicaciones_log"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo = Column(String(50), nullable=False)  # credenciales, bienvenida, cesado, cumpleanos, festividad, anuncio
    destinatario_email = Column(String(255), nullable=False)
    asunto = Column(String(300), nullable=False)
    estado = Column(String(20), nullable=False, default="enviado")  # enviado, fallido
    fecha_envio = Column(DateTime, server_default=func.now())
    postulante_id = Column(Integer, ForeignKey("postulantes.id"), nullable=True)
    detalle = Column(Text)
