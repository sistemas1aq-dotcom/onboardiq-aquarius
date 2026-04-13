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


# --- Daily Check (check-hoy) ---

class CumpleanosHoyItem(BaseModel):
    id: int
    nombre: str
    email: str


class FestividadHoyItem(BaseModel):
    nombre: str
    mensaje: str


class CheckHoyResponse(BaseModel):
    cumpleanos: list[CumpleanosHoyItem] = []
    festividad: Optional[FestividadHoyItem] = None
    ya_enviado_cumpleanos: bool = False
    ya_enviado_festividad: bool = False


# --- Email Plantillas ---

class PlantillaResponse(BaseModel):
    id: int
    tipo: str
    asunto: str
    contenido: str
    variables_disponibles: Optional[str] = None
    activa: bool
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True


class PlantillaUpdate(BaseModel):
    asunto: Optional[str] = None
    contenido: Optional[str] = None
    activa: Optional[bool] = None
