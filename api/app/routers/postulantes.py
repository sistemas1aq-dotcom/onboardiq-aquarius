from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.postulante import Postulante
from ..schemas.postulante import (
    PostulanteCreate,
    PostulanteUpdate,
    PostulanteResponse,
)
from ..auth.dependencies import get_current_user
from ..services.auditoria import log_action

router = APIRouter(tags=["Postulantes"])


@router.get("/", response_model=list[PostulanteResponse])
def list_postulantes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[str] = None,
    puesto: Optional[str] = None,
    buscar: Optional[str] = None,
    riesgo: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = db.query(Postulante).join(Usuario, Postulante.usuario_id == Usuario.id)

    if estado:
        query = query.filter(Postulante.estado == estado)
    if puesto:
        query = query.filter(Postulante.puesto.contains(puesto))
    if riesgo:
        query = query.filter(Postulante.riesgo == riesgo)
    if buscar:
        query = query.filter(
            (Usuario.nombre.contains(buscar))
            | (Usuario.dni.contains(buscar))
            | (Usuario.email.contains(buscar))
        )

    postulantes = (
        query.order_by(Postulante.fecha_registro.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for p in postulantes:
        data = PostulanteResponse(
            id=p.id,
            usuario_id=p.usuario_id,
            puesto=p.puesto,
            estado=p.estado,
            avance=p.avance or 0,
            riesgo=p.riesgo,
            comentarios=p.comentarios,
            fecha_registro=p.fecha_registro,
            nombre=p.usuario.nombre if p.usuario else None,
            dni=p.usuario.dni if p.usuario else None,
            email=p.usuario.email if p.usuario else None,
        )
        result.append(data)
    return result


@router.get("/{postulante_id}", response_model=PostulanteResponse)
def get_postulante(
    postulante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    p = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")
    return PostulanteResponse(
        id=p.id,
        usuario_id=p.usuario_id,
        puesto=p.puesto,
        estado=p.estado,
        avance=p.avance or 0,
        riesgo=p.riesgo,
        comentarios=p.comentarios,
        fecha_registro=p.fecha_registro,
        nombre=p.usuario.nombre if p.usuario else None,
        dni=p.usuario.dni if p.usuario else None,
        email=p.usuario.email if p.usuario else None,
    )


@router.post("/", response_model=PostulanteResponse, status_code=status.HTTP_201_CREATED)
def create_postulante(
    data: PostulanteCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = Postulante(
        usuario_id=data.usuario_id,
        puesto=data.puesto,
        estado=data.estado or "En Evaluacion",
        riesgo=data.riesgo or "bajo",
        comentarios=data.comentarios,
    )
    db.add(postulante)
    db.commit()
    db.refresh(postulante)
    log_action(
        db,
        current_user.id,
        "crear_postulante",
        f"Postulante ID {postulante.id} creado para puesto {data.puesto}",
        request.client.host if request.client else None,
    )
    return PostulanteResponse(
        id=postulante.id,
        usuario_id=postulante.usuario_id,
        puesto=postulante.puesto,
        estado=postulante.estado,
        avance=postulante.avance or 0,
        riesgo=postulante.riesgo,
        comentarios=postulante.comentarios,
        fecha_registro=postulante.fecha_registro,
    )


@router.put("/{postulante_id}", response_model=PostulanteResponse)
def update_postulante(
    postulante_id: int,
    data: PostulanteUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(postulante, key, value)
    db.commit()
    db.refresh(postulante)

    log_action(
        db,
        current_user.id,
        "actualizar_postulante",
        f"Postulante ID {postulante_id} actualizado: {list(update_data.keys())}",
        request.client.host if request.client else None,
    )
    return PostulanteResponse(
        id=postulante.id,
        usuario_id=postulante.usuario_id,
        puesto=postulante.puesto,
        estado=postulante.estado,
        avance=postulante.avance or 0,
        riesgo=postulante.riesgo,
        comentarios=postulante.comentarios,
        fecha_registro=postulante.fecha_registro,
        nombre=postulante.usuario.nombre if postulante.usuario else None,
        dni=postulante.usuario.dni if postulante.usuario else None,
        email=postulante.usuario.email if postulante.usuario else None,
    )


@router.delete("/{postulante_id}")
def delete_postulante(
    postulante_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")
    db.delete(postulante)
    db.commit()
    log_action(
        db,
        current_user.id,
        "eliminar_postulante",
        f"Postulante ID {postulante_id} eliminado",
        request.client.host if request.client else None,
    )
    return {"message": "Postulante eliminado correctamente"}


@router.put("/{postulante_id}/estado")
def update_estado(
    postulante_id: int,
    estado: str = Query(..., description="Nuevo estado: Aprobado, Rechazado, En Evaluacion"),
    comentario: Optional[str] = None,
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    estados_validos = ["En Evaluacion", "Aprobado", "Rechazado", "Documentacion", "Entrevista", "Contratado"]
    if estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado invalido. Estados validos: {', '.join(estados_validos)}",
        )

    old_estado = postulante.estado
    postulante.estado = estado
    if comentario:
        postulante.comentarios = comentario
    db.commit()
    db.refresh(postulante)

    log_action(
        db,
        current_user.id,
        "cambio_estado_postulante",
        f"Postulante ID {postulante_id}: {old_estado} -> {estado}",
        request.client.host if request and request.client else None,
    )
    return {
        "message": f"Estado actualizado a '{estado}'",
        "postulante_id": postulante_id,
        "estado_anterior": old_estado,
        "estado_nuevo": estado,
    }
