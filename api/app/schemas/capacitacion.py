from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class CapacitacionBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha_limite: Optional[date] = None
    obligatoria: Optional[bool] = True


class CapacitacionCreate(CapacitacionBase):
    pass


class CapacitacionResponse(CapacitacionBase):
    id: int
    cumplimiento: Optional[int] = 0

    class Config:
        from_attributes = True


class CapacitacionTrabajadorUpdate(BaseModel):
    cumplimiento: int
