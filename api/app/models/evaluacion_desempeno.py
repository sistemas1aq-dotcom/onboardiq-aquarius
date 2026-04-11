from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Text, Numeric
from sqlalchemy.sql import func
from .database import Base


class EvaluacionDesempeno(Base):
    __tablename__ = "evaluacion_desempeno"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trabajador_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    evaluador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    periodo = Column(String(20), nullable=False)
    tipo = Column(String(20), nullable=False)  # trimestral, semestral, anual
    fecha_evaluacion = Column(Date)
    puntaje_general = Column(Numeric(5, 2), default=0)
    estado = Column(String(20), default="borrador")  # borrador, enviada, completada
    comentarios_generales = Column(Text)
    fecha_creacion = Column(DateTime, server_default=func.now())


class CriterioEvaluacion(Base):
    __tablename__ = "criterio_evaluacion"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)
    peso = Column(Numeric(5, 2), default=1)
    categoria = Column(String(50))  # competencias, objetivos, valores
    activo = Column(Boolean, default=True)


class EvaluacionDetalle(Base):
    __tablename__ = "evaluacion_detalle"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    evaluacion_desempeno_id = Column(Integer, ForeignKey("evaluacion_desempeno.id"), nullable=False)
    criterio_id = Column(Integer, ForeignKey("criterio_evaluacion.id"), nullable=False)
    puntaje = Column(Integer, default=0)  # 0-5
    comentario = Column(Text)
