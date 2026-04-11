import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.anuncio import Anuncio
from ..models.comunicacion import ComunicacionLog
from ..auth.dependencies import get_current_user, require_role
from ..schemas.anuncio import AnuncioCreate, AnuncioUpdate, AnuncioResponse
from ..services.email_service import send_bulk_email

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=list[AnuncioResponse])
def listar_anuncios(
    tipo: Optional[str] = Query(None),
    activo: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Lista anuncios con filtros opcionales."""
    query = db.query(Anuncio)
    if tipo is not None:
        query = query.filter(Anuncio.tipo == tipo)
    if activo is not None:
        query = query.filter(Anuncio.activo == activo)
    return query.order_by(Anuncio.id.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=AnuncioResponse)
def crear_anuncio(
    data: AnuncioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Crea un nuevo anuncio."""
    anuncio = Anuncio(
        titulo=data.titulo,
        contenido=data.contenido,
        tipo=data.tipo,
        destinatarios=data.destinatarios,
        imagen_url=data.imagen_url,
        activo=data.activo,
        creado_por=current_user.id,
    )
    db.add(anuncio)
    db.commit()
    db.refresh(anuncio)
    return anuncio


@router.put("/{anuncio_id}", response_model=AnuncioResponse)
def actualizar_anuncio(
    anuncio_id: int,
    data: AnuncioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Actualiza un anuncio existente."""
    anuncio = db.query(Anuncio).filter(Anuncio.id == anuncio_id).first()
    if not anuncio:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(anuncio, key, value)

    db.commit()
    db.refresh(anuncio)
    return anuncio


@router.delete("/{anuncio_id}")
def eliminar_anuncio(
    anuncio_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Elimina un anuncio."""
    anuncio = db.query(Anuncio).filter(Anuncio.id == anuncio_id).first()
    if not anuncio:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")

    db.delete(anuncio)
    db.commit()
    return {"detail": "Anuncio eliminado"}


@router.post("/{anuncio_id}/enviar")
def enviar_anuncio(
    anuncio_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Envia un anuncio por email a todos los usuarios activos."""
    anuncio = db.query(Anuncio).filter(Anuncio.id == anuncio_id).first()
    if not anuncio:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")

    usuarios = db.query(Usuario).filter(Usuario.activo == True).all()
    if not usuarios:
        raise HTTPException(status_code=400, detail="No hay usuarios activos")

    recipients = [u.email for u in usuarios if u.email]

    html_body = f"<h2>{anuncio.titulo}</h2><p>{anuncio.contenido}</p>"
    result = send_bulk_email(recipients, f"Aquarius - {anuncio.titulo}", html_body)

    # Registrar en log
    for u in usuarios:
        if u.email:
            log = ComunicacionLog(
                tipo="anuncio",
                destinatario_email=u.email,
                asunto=f"Aquarius - {anuncio.titulo}",
                estado="enviado",
                detalle=f"Anuncio ID: {anuncio.id}",
            )
            db.add(log)

    db.commit()
    return {"detail": "Anuncio enviado", "enviados": result["sent"], "fallidos": result["failed"]}


@router.get("/publicos", response_model=list[AnuncioResponse])
def listar_anuncios_publicos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista anuncios activos para el portal (cualquier usuario autenticado)."""
    return (
        db.query(Anuncio)
        .filter(Anuncio.activo == True)
        .order_by(Anuncio.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
