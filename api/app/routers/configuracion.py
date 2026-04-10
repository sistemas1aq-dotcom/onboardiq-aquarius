from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.configuracion import Configuracion
from ..auth.dependencies import require_role
from ..services.auditoria import log_action

router = APIRouter(tags=["Configuracion"])


class ConfigItem(BaseModel):
    clave: str
    valor: str
    descripcion: Optional[str] = None


class ConfigUpdateRequest(BaseModel):
    items: list[ConfigItem]


@router.get("/")
def get_configuracion(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    configs = db.query(Configuracion).order_by(Configuracion.clave).all()
    return [
        {
            "id": c.id,
            "clave": c.clave,
            "valor": c.valor,
            "descripcion": c.descripcion,
            "fecha_actualizacion": c.fecha_actualizacion.isoformat() if c.fecha_actualizacion else None,
        }
        for c in configs
    ]


@router.put("/")
def update_configuracion(
    data: ConfigUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    updated = []
    created = []

    for item in data.items:
        config = db.query(Configuracion).filter(Configuracion.clave == item.clave).first()
        if config:
            config.valor = item.valor
            if item.descripcion is not None:
                config.descripcion = item.descripcion
            config.fecha_actualizacion = datetime.now(timezone.utc)
            updated.append(item.clave)
        else:
            config = Configuracion(
                clave=item.clave,
                valor=item.valor,
                descripcion=item.descripcion,
            )
            db.add(config)
            created.append(item.clave)

    db.commit()

    log_action(
        db,
        current_user.id,
        "actualizar_configuracion",
        f"Actualizados: {updated}, Creados: {created}",
        request.client.host if request.client else None,
    )

    return {
        "message": "Configuracion actualizada",
        "actualizados": updated,
        "creados": created,
    }
