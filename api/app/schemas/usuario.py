from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    nombre: str


class UsuarioBase(BaseModel):
    email: str
    nombre: str
    dni: Optional[str] = None
    rol: str
    telefono: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    email: Optional[str] = None
    nombre: Optional[str] = None
    dni: Optional[str] = None
    rol: Optional[str] = None
    telefono: Optional[str] = None
    activo: Optional[bool] = None


class UsuarioResponse(UsuarioBase):
    id: int
    activo: bool
    fecha_creacion: Optional[datetime] = None
    ultimo_acceso: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
