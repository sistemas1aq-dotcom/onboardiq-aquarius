from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, Any


class PostulanteBase(BaseModel):
    puesto: str
    estado: Optional[str] = "En Evaluacion"
    riesgo: Optional[str] = "bajo"
    comentarios: Optional[str] = None


class PostulanteCreate(PostulanteBase):
    usuario_id: int


class PostulanteUpdate(BaseModel):
    puesto: Optional[str] = None
    estado: Optional[str] = None
    avance: Optional[int] = None
    riesgo: Optional[str] = None
    comentarios: Optional[str] = None


class PostulanteResponse(PostulanteBase):
    id: int
    usuario_id: int
    avance: int
    fecha_registro: Optional[datetime] = None
    nombre: Optional[str] = None
    dni: Optional[str] = None
    email: Optional[str] = None
    tecnico: Optional[int] = 0
    psicologico: Optional[int] = 0
    entrevista: Optional[int] = 0

    class Config:
        from_attributes = True


class FichaPersonalBase(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None  # Frontend field, split into paterno/materno in backend
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    lugar_nacimiento: Optional[str] = None
    estado_civil: Optional[str] = None
    genero: Optional[str] = None
    direccion: Optional[str] = None
    distrito: Optional[str] = None
    provincia: Optional[str] = None
    departamento: Optional[str] = None
    telefono: Optional[str] = None
    telefono_emergencia: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    grado_instruccion: Optional[str] = None
    carrera: Optional[str] = None
    universidad: Optional[str] = None
    anio_egreso: Optional[int] = None
    colegiatura: Optional[str] = None
    experiencia_laboral: Optional[Any] = None
    idiomas: Optional[Any] = None
    habilidades: Optional[Any] = None
    referencias: Optional[Any] = None
    pretension_salarial: Optional[float] = None
    disponibilidad: Optional[str] = None
    modalidad_preferida: Optional[str] = None
    tipo_sangre: Optional[str] = None
    alergias: Optional[str] = None
    condiciones_medicas: Optional[str] = None
    discapacidad: Optional[bool] = False
    detalle_discapacidad: Optional[str] = None
    estudios_adicionales: Optional[Any] = None


class FichaPersonalResponse(FichaPersonalBase):
    id: int
    postulante_id: int

    class Config:
        from_attributes = True
