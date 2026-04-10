from pydantic import BaseModel
from typing import Optional


class DatoBancarioBase(BaseModel):
    tiene_cuenta: Optional[bool] = False
    entidad: Optional[str] = None
    tipo_cuenta: Optional[str] = None
    numero_cuenta: Optional[str] = None
    cci: Optional[str] = None


class DatoBancarioCreate(DatoBancarioBase):
    trabajador_id: int


class DatoBancarioResponse(DatoBancarioBase):
    id: int
    trabajador_id: int

    class Config:
        from_attributes = True
