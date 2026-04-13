from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Numeric, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class Postulante(Base):
    __tablename__ = "postulantes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    puesto = Column(String(200), nullable=False)
    estado = Column(String(30), default="En Evaluacion")
    avance = Column(Integer, default=0)
    riesgo = Column(String(10), default="bajo")
    fecha_registro = Column(DateTime, server_default=func.now())
    comentarios = Column(String)
    area = Column(String(100))

    usuario = relationship("Usuario")
    ficha = relationship("FichaPersonal", uselist=False, back_populates="postulante")
    documentos = relationship("Documento", back_populates="postulante")
    entrevistas = relationship("Entrevista", back_populates="postulante")


class FichaPersonal(Base):
    __tablename__ = "ficha_personal"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    postulante_id = Column(Integer, ForeignKey("postulantes.id"), nullable=False)
    nombres = Column(String(100))
    apellido_paterno = Column(String(100))
    apellido_materno = Column(String(100))
    fecha_nacimiento = Column(Date)
    lugar_nacimiento = Column(String(200))
    estado_civil = Column(String(30))
    genero = Column(String(20))
    direccion = Column(String(300))
    distrito = Column(String(100))
    provincia = Column(String(100))
    departamento = Column(String(100))
    telefono = Column(String(20))
    telefono_emergencia = Column(String(20))
    contacto_emergencia = Column(String(100))
    grado_instruccion = Column(String(50))
    carrera = Column(String(200))
    universidad = Column(String(200))
    anio_egreso = Column(Integer)
    colegiatura = Column(String(50))
    experiencia_laboral = Column(String)  # JSON
    idiomas = Column(String)  # JSON
    habilidades = Column(String)  # JSON
    referencias = Column(String)  # JSON
    pretension_salarial = Column(Numeric(10, 2))
    disponibilidad = Column(String(50))
    modalidad_preferida = Column(String(50))
    tipo_sangre = Column(String(10))
    alergias = Column(String(300))
    condiciones_medicas = Column(String(300))
    discapacidad = Column(Boolean, default=False)
    detalle_discapacidad = Column(String(300))
    fecha_actualizacion = Column(DateTime, server_default=func.now())

    postulante = relationship("Postulante", back_populates="ficha")
