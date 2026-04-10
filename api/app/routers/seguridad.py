from typing import Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.auditoria import Auditoria
from ..auth.dependencies import require_role

router = APIRouter(tags=["Seguridad"])


@router.get("/auditoria")
def get_auditoria(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    usuario_id: Optional[int] = None,
    accion: Optional[str] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    buscar: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    query = db.query(Auditoria)

    if usuario_id:
        query = query.filter(Auditoria.usuario_id == usuario_id)
    if accion:
        query = query.filter(Auditoria.accion.contains(accion))
    if fecha_desde:
        query = query.filter(Auditoria.fecha >= datetime.combine(fecha_desde, datetime.min.time()))
    if fecha_hasta:
        query = query.filter(Auditoria.fecha <= datetime.combine(fecha_hasta, datetime.max.time()))
    if buscar:
        query = query.filter(
            (Auditoria.accion.contains(buscar))
            | (Auditoria.detalle.contains(buscar))
        )

    total = query.count()
    registros = query.order_by(Auditoria.fecha.desc()).offset(skip).limit(limit).all()

    # Enrich with user names
    result = []
    for r in registros:
        usuario = None
        if r.usuario_id:
            usuario = db.query(Usuario).filter(Usuario.id == r.usuario_id).first()
        result.append({
            "id": r.id,
            "usuario_id": r.usuario_id,
            "usuario_nombre": usuario.nombre if usuario else None,
            "usuario_email": usuario.email if usuario else None,
            "accion": r.accion,
            "detalle": r.detalle,
            "ip_address": r.ip_address,
            "fecha": r.fecha.isoformat() if r.fecha else None,
        })

    return {
        "total": total,
        "registros": result,
    }
