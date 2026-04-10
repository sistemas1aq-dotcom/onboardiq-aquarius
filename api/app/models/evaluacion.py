from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class Evaluacion(Base):
    __tablename__ = "evaluaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    tipo = Column(String(30), nullable=False)  # tecnica, psicologica, entrevista
    descripcion = Column(String)
    duracion_minutos = Column(Integer, default=60)
    puntaje_minimo = Column(Integer, default=60)
    activa = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())

    preguntas = relationship("Pregunta", back_populates="evaluacion")


class Pregunta(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    evaluacion_id = Column(Integer, ForeignKey("evaluaciones.id"), nullable=False)
    pregunta = Column(String, nullable=False)
    opciones = Column(String, nullable=False)  # JSON array
    respuesta_correcta = Column(Integer, nullable=False)
    puntaje = Column(Integer, default=20)
    orden = Column(Integer, default=0)

    evaluacion = relationship("Evaluacion", back_populates="preguntas")


class EvaluacionPostulante(Base):
    __tablename__ = "evaluacion_postulante"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    evaluacion_id = Column(Integer, ForeignKey("evaluaciones.id"), nullable=False)
    postulante_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    evaluador_id = Column(Integer, ForeignKey("usuarios.id"))
    puntaje_obtenido = Column(Integer)
    estado = Column(String(20), default="pendiente")
    fecha_asignacion = Column(DateTime, server_default=func.now())
    fecha_completado = Column(DateTime)
    comentario_evaluador = Column(String)

    evaluacion = relationship("Evaluacion")
    postulante = relationship("Postulante")
    evaluador = relationship("Usuario")


class Respuesta(Base):
    __tablename__ = "respuestas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    evaluacion_postulante_id = Column(Integer, ForeignKey("evaluacion_postulante.id"), nullable=False)
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"), nullable=False)
    respuesta_seleccionada = Column(Integer, nullable=False)
    es_correcta = Column(Boolean)
    fecha_respuesta = Column(DateTime, server_default=func.now())
