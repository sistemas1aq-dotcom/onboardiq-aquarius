from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AnuncioCreate(BaseModel):
    titulo: str
    contenido: str
    tipo: str = "general"
    destinatarios: str = "todos"
    imagen_url: Optional[str] = None
    activo: bool = True


class AnuncioUpdate(BaseModel):
    titulo: Optional[str] = None
    contenido: Optional[str] = None
    tipo: Optional[str] = None
    destinatarios: Optional[str] = None
    imagen_url: Optional[str] = None
    activo: Optional[bool] = None


class AnuncioResponse(BaseModel):
    id: int
    titulo: str
    contenido: str
    tipo: str
    destinatarios: str
    fecha_publicacion: Optional[datetime] = None
    imagen_url: Optional[str] = None
    activo: bool
    creado_por: Optional[int] = None
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True
