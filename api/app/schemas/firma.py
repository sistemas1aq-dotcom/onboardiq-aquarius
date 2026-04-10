from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FirmaCreate(BaseModel):
    tipo_documento: str
    firma_data: str  # base64
    ip_address: Optional[str] = None


class FirmaResponse(BaseModel):
    id: int
    usuario_id: int
    tipo_documento: str
    firma_data: str
    ip_address: Optional[str] = None
    hash_documento: Optional[str] = None
    fecha_firma: Optional[datetime] = None

    class Config:
        from_attributes = True
