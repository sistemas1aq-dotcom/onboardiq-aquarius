from pydantic import BaseModel
from datetime import date
from typing import Optional


class DerechohabienteBase(BaseModel):
    nombre_completo: str
    parentesco: str
    dni: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = None
    telefono: Optional[str] = None


class DerechohabienteCreate(DerechohabienteBase):
    trabajador_id: int


class DerechohabienteResponse(DerechohabienteBase):
    id: int
    trabajador_id: int

    class Config:
        from_attributes = True
