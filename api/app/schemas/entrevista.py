from pydantic import BaseModel
from datetime import date
from typing import Optional


class EntrevistaBase(BaseModel):
    tipo: str
    fecha: date
    hora: str
    lugar: Optional[str] = None
    evaluador_nombre: Optional[str] = None
    duracion: Optional[str] = None


class EntrevistaCreate(EntrevistaBase):
    postulante_id: int


class EntrevistaUpdate(BaseModel):
    estado: Optional[str] = None
    notas: Optional[str] = None
    fecha: Optional[date] = None
    hora: Optional[str] = None
    lugar: Optional[str] = None


class EntrevistaResponse(EntrevistaBase):
    id: int
    postulante_id: int
    estado: str
    notas: Optional[str] = None

    class Config:
        from_attributes = True
