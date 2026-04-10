from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.entrevista import Entrevista
from ..models.postulante import Postulante
from ..schemas.entrevista import (
    EntrevistaCreate,
    EntrevistaUpdate,
    EntrevistaResponse,
)
from ..auth.dependencies import get_current_user
from ..services.auditoria import log_action

router = APIRouter(tags=["Entrevistas"])


@router.get("/", response_model=list[EntrevistaResponse])
def list_entrevistas(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    postulante_id: Optional[int] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = db.query(Entrevista)
    if postulante_id:
        query = query.filter(Entrevista.postulante_id == postulante_id)
    if estado:
        query = query.filter(Entrevista.estado == estado)
    entrevistas = query.order_by(Entrevista.fecha.desc()).offset(skip).limit(limit).all()
    return entrevistas


@router.get("/{entrevista_id}", response_model=EntrevistaResponse)
def get_entrevista(
    entrevista_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    entrevista = db.query(Entrevista).filter(Entrevista.id == entrevista_id).first()
    if not entrevista:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")
    return entrevista


@router.post("/", response_model=EntrevistaResponse, status_code=status.HTTP_201_CREATED)
def create_entrevista(
    data: EntrevistaCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = db.query(Postulante).filter(Postulante.id == data.postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    entrevista = Entrevista(
        postulante_id=data.postulante_id,
        tipo=data.tipo,
        fecha=data.fecha,
        hora=data.hora,
        lugar=data.lugar,
        evaluador_nombre=data.evaluador_nombre,
        duracion=data.duracion,
    )
    db.add(entrevista)
    db.commit()
    db.refresh(entrevista)

    log_action(
        db,
        current_user.id,
        "crear_entrevista",
        f"Entrevista tipo '{data.tipo}' creada para postulante ID {data.postulante_id}",
        request.client.host if request.client else None,
    )
    return entrevista


@router.put("/{entrevista_id}", response_model=EntrevistaResponse)
def update_entrevista(
    entrevista_id: int,
    data: EntrevistaUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    entrevista = db.query(Entrevista).filter(Entrevista.id == entrevista_id).first()
    if not entrevista:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(entrevista, key, value)
    db.commit()
    db.refresh(entrevista)

    log_action(
        db,
        current_user.id,
        "actualizar_entrevista",
        f"Entrevista ID {entrevista_id} actualizada",
        request.client.host if request.client else None,
    )
    return entrevista


@router.delete("/{entrevista_id}")
def delete_entrevista(
    entrevista_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    entrevista = db.query(Entrevista).filter(Entrevista.id == entrevista_id).first()
    if not entrevista:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")
    db.delete(entrevista)
    db.commit()
    log_action(
        db,
        current_user.id,
        "eliminar_entrevista",
        f"Entrevista ID {entrevista_id} eliminada",
        request.client.host if request.client else None,
    )
    return {"message": "Entrevista eliminada correctamente"}
