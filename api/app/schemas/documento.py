from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentoBase(BaseModel):
    tipo: str
    requerido: Optional[bool] = True


class DocumentoCreate(DocumentoBase):
    postulante_id: int


class DocumentoUpdate(BaseModel):
    estado: Optional[str] = None
    observacion: Optional[str] = None
    nombre_archivo: Optional[str] = None
    url: Optional[str] = None


class DocumentoResponse(DocumentoBase):
    id: int
    postulante_id: int
    nombre_archivo: Optional[str] = None
    url: Optional[str] = None
    estado: str
    observacion: Optional[str] = None
    fecha_subida: Optional[datetime] = None
    fecha_revision: Optional[datetime] = None

    class Config:
        from_attributes = True
