from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.usuario import Usuario
from ..schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from ..auth.dependencies import require_role
from ..auth.password import hash_password
from ..services.auditoria import log_action

router = APIRouter(tags=["Usuarios"])


@router.get("/", response_model=list[UsuarioResponse])
def list_usuarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    rol: Optional[str] = None,
    activo: Optional[bool] = None,
    buscar: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    query = db.query(Usuario)
    if rol:
        query = query.filter(Usuario.rol == rol)
    if activo is not None:
        query = query.filter(Usuario.activo == activo)
    if buscar:
        query = query.filter(
            (Usuario.nombre.contains(buscar))
            | (Usuario.email.contains(buscar))
            | (Usuario.dni.contains(buscar))
        )
    usuarios = query.order_by(Usuario.id.desc()).offset(skip).limit(limit).all()
    return usuarios


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def get_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_usuario(
    data: UsuarioCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    existing = db.query(Usuario).filter(Usuario.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya esta registrado")
    if data.dni:
        existing_dni = db.query(Usuario).filter(Usuario.dni == data.dni).first()
        if existing_dni:
            raise HTTPException(status_code=400, detail="El DNI ya esta registrado")

    usuario = Usuario(
        email=data.email,
        password_hash=hash_password(data.password),
        nombre=data.nombre,
        dni=data.dni,
        rol=data.rol,
        telefono=data.telefono,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    log_action(
        db,
        current_user.id,
        "crear_usuario",
        f"Usuario '{data.email}' creado con rol '{data.rol}'",
        request.client.host if request.client else None,
    )
    return usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def update_usuario(
    usuario_id: int,
    data: UsuarioUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = data.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] != usuario.email:
        existing = db.query(Usuario).filter(Usuario.email == update_data["email"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="El email ya esta en uso")

    if "dni" in update_data and update_data["dni"] != usuario.dni:
        existing = db.query(Usuario).filter(Usuario.dni == update_data["dni"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="El DNI ya esta en uso")

    for key, value in update_data.items():
        setattr(usuario, key, value)
    db.commit()
    db.refresh(usuario)

    log_action(
        db,
        current_user.id,
        "actualizar_usuario",
        f"Usuario ID {usuario_id} actualizado: {list(update_data.keys())}",
        request.client.host if request.client else None,
    )
    return usuario


@router.delete("/{usuario_id}")
def delete_usuario(
    usuario_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    if usuario_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puede eliminar su propio usuario")
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Soft delete: deactivate instead of hard delete
    usuario.activo = False
    db.commit()

    log_action(
        db,
        current_user.id,
        "desactivar_usuario",
        f"Usuario ID {usuario_id} desactivado",
        request.client.host if request.client else None,
    )
    return {"message": "Usuario desactivado correctamente"}
