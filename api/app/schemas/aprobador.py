from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AprobadorItem(BaseModel):
    usuario_id: int
    orden: int


class AprobadorAsignar(BaseModel):
    aprobadores: list[AprobadorItem]


class ReordenarItem(BaseModel):
    id: int
    orden: int


class AprobadorReordenar(BaseModel):
    aprobadores: list[ReordenarItem]


class AprobadorAccion(BaseModel):
    comentario: Optional[str] = None


class AprobadorResponse(BaseModel):
    id: int
    postulante_id: int
    usuario_id: int
    orden: int
    estado: str
    comentario: Optional[str] = None
    fecha_accion: Optional[datetime] = None
    usuario_nombre: Optional[str] = None
    usuario_area: Optional[str] = None

    class Config:
        from_attributes = True


class PendienteResponse(BaseModel):
    id: int
    postulante_id: int
    usuario_id: int
    orden: int
    estado: str
    comentario: Optional[str] = None
    fecha_accion: Optional[datetime] = None
    postulante_nombre: Optional[str] = None
    postulante_puesto: Optional[str] = None
    postulante_estado: Optional[str] = None
    evaluacion_id: Optional[int] = None
    evaluacion_nombre: Optional[str] = None

    class Config:
        from_attributes = True
