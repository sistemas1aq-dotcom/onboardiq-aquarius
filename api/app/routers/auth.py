from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.usuario import Usuario
from ..schemas.usuario import (
    LoginRequest,
    TokenResponse,
    UsuarioResponse,
    ChangePasswordRequest,
)
from ..auth.jwt_handler import create_access_token
from ..auth.password import verify_password, hash_password
from ..auth.dependencies import get_current_user
from ..services.auditoria import log_action

router = APIRouter(tags=["Autenticacion"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrectos",
        )
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado. Contacte al administrador.",
        )
    user.ultimo_acceso = datetime.now(timezone.utc)
    db.commit()
    token = create_access_token({"sub": str(user.id), "rol": user.rol})
    log_action(
        db,
        user.id,
        "login",
        f"Inicio de sesion exitoso",
        request.client.host if request.client else None,
    )
    return TokenResponse(
        access_token=token,
        rol=user.rol,
        nombre=user.nombre,
    )


@router.get("/me", response_model=UsuarioResponse)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contrasena actual incorrecta",
        )
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    log_action(
        db,
        current_user.id,
        "cambio_contrasena",
        "Cambio de contrasena exitoso",
        request.client.host if request.client else None,
    )
    return {"message": "Contrasena actualizada correctamente"}
