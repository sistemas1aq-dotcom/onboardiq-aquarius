from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ComunicacionResponse(BaseModel):
    id: int
    tipo: str
    destinatario_email: str
    asunto: str
    estado: str
    fecha_envio: Optional[datetime] = None
    postulante_id: Optional[int] = None
    detalle: Optional[str] = None

    class Config:
        from_attributes = True


class CumpleanosResponse(BaseModel):
    postulante_id: int
    nombre: str
    email: str
    puesto: str
    fecha_nacimiento: Optional[str] = None


class FestividadResponse(BaseModel):
    id: int
    nombre: str
    fecha: str
    mensaje: Optional[str] = None
    activa: bool

    class Config:
        from_attributes = True
