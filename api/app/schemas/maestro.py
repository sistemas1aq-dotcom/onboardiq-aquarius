from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AreaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class AreaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activa: Optional[bool] = None


class AreaResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    activa: bool
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True


class CargoCreate(BaseModel):
    nombre: str
    area_id: int
    descripcion: Optional[str] = None


class CargoUpdate(BaseModel):
    nombre: Optional[str] = None
    area_id: Optional[int] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None


class CargoResponse(BaseModel):
    id: int
    nombre: str
    area_id: int
    area_nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activo: bool
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True
