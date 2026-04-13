from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from .database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nombre = Column(String(200), nullable=False)
    apellido_paterno = Column(String(100))
    apellido_materno = Column(String(100))
    dni = Column(String(20), unique=True, index=True)
    rol = Column(String(20), nullable=False)  # admin, evaluador, postulante, trabajador
    telefono = Column(String(20))
    area = Column(String(100))
    cargo = Column(String(100))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())
    ultimo_acceso = Column(DateTime)
