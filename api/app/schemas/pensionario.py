from pydantic import BaseModel
from typing import Optional


class RegimenPensionarioBase(BaseModel):
    tipo: str  # afp, onp
    entidad: Optional[str] = None
    cuspp: Optional[str] = None
    primer_trabajo: Optional[bool] = False


class RegimenPensionarioCreate(RegimenPensionarioBase):
    trabajador_id: int


class RegimenPensionarioResponse(RegimenPensionarioBase):
    id: int
    trabajador_id: int

    class Config:
        from_attributes = True
