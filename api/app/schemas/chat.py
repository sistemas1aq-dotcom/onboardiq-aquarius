from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ConversacionCreate(BaseModel):
    participante_ids: list[int]
    nombre: Optional[str] = None
    tipo: Optional[str] = "directo"  # directo, grupo


class ConversacionResponse(BaseModel):
    id: int
    nombre: Optional[str] = None
    tipo: str
    creado_por: int
    fecha_creacion: Optional[datetime] = None
    ultimo_mensaje: Optional[str] = None
    no_leidos: Optional[int] = 0
    participantes: Optional[list[dict]] = None

    class Config:
        from_attributes = True


class MensajeCreate(BaseModel):
    contenido: str


class MensajeResponse(BaseModel):
    id: int
    conversacion_id: int
    usuario_id: int
    contenido: Optional[str] = None
    tipo_mensaje: str
    archivo_url: Optional[str] = None
    archivo_nombre: Optional[str] = None
    archivo_tamano: Optional[int] = None
    fecha_envio: Optional[datetime] = None
    leido: bool
    usuario_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class NoLeidosResponse(BaseModel):
    total: int
