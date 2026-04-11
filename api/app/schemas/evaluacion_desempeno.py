from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


# --- Criterio ---

class CriterioCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    peso: Optional[float] = 1.0
    categoria: Optional[str] = None  # competencias, objetivos, valores
    activo: Optional[bool] = True


class CriterioResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    peso: float
    categoria: Optional[str] = None
    activo: bool

    class Config:
        from_attributes = True


# --- Detalle ---

class EvalDetalleCreate(BaseModel):
    criterio_id: int
    puntaje: int  # 0-5
    comentario: Optional[str] = None


class EvalDetalleResponse(BaseModel):
    id: int
    criterio_id: int
    puntaje: int
    comentario: Optional[str] = None

    class Config:
        from_attributes = True


# --- Evaluacion Desempeno ---

class EvalDesempenoCreate(BaseModel):
    trabajador_id: int
    evaluador_id: int
    periodo: str
    tipo: str  # trimestral, semestral, anual
    fecha_evaluacion: Optional[date] = None
    comentarios_generales: Optional[str] = None


class EvalDesempenoUpdate(BaseModel):
    detalles: Optional[list[EvalDetalleCreate]] = None
    comentarios_generales: Optional[str] = None
    estado: Optional[str] = None


class EvalDesempenoResponse(BaseModel):
    id: int
    trabajador_id: int
    evaluador_id: int
    periodo: str
    tipo: str
    fecha_evaluacion: Optional[date] = None
    puntaje_general: Optional[float] = 0
    estado: str
    comentarios_generales: Optional[str] = None
    fecha_creacion: Optional[datetime] = None
    detalles: Optional[list[EvalDetalleResponse]] = None
    trabajador_nombre: Optional[str] = None
    evaluador_nombre: Optional[str] = None

    class Config:
        from_attributes = True
