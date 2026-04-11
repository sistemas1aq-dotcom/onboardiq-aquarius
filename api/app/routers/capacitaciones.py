from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.capacitacion import Capacitacion, CapacitacionTrabajador
from ..models.postulante import Postulante
from ..auth.dependencies import require_role
from ..schemas.capacitacion import CapacitacionCreate

router = APIRouter()


@router.get("/")
def listar_capacitaciones(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Lista todas las capacitaciones."""
    capacitaciones = (
        db.query(Capacitacion)
        .order_by(Capacitacion.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return capacitaciones


@router.post("/")
def crear_capacitacion(
    data: CapacitacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Crea una nueva capacitacion."""
    capacitacion = Capacitacion(
        nombre=data.nombre,
        descripcion=data.descripcion,
        fecha_limite=data.fecha_limite,
        obligatoria=data.obligatoria,
    )
    db.add(capacitacion)
    db.commit()
    db.refresh(capacitacion)
    return capacitacion


@router.put("/{capacitacion_id}")
def actualizar_capacitacion(
    capacitacion_id: int,
    data: CapacitacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Actualiza una capacitacion existente."""
    capacitacion = db.query(Capacitacion).filter(Capacitacion.id == capacitacion_id).first()
    if not capacitacion:
        raise HTTPException(status_code=404, detail="Capacitacion no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(capacitacion, key, value)

    db.commit()
    db.refresh(capacitacion)
    return capacitacion


@router.delete("/{capacitacion_id}")
def eliminar_capacitacion(
    capacitacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Elimina una capacitacion."""
    capacitacion = db.query(Capacitacion).filter(Capacitacion.id == capacitacion_id).first()
    if not capacitacion:
        raise HTTPException(status_code=404, detail="Capacitacion no encontrada")

    # Delete assigned workers first
    db.query(CapacitacionTrabajador).filter(
        CapacitacionTrabajador.capacitacion_id == capacitacion_id
    ).delete()

    db.delete(capacitacion)
    db.commit()
    return {"detail": "Capacitacion eliminada"}


@router.post("/{capacitacion_id}/asignar")
def asignar_trabajadores(
    capacitacion_id: int,
    body: dict,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Asigna trabajadores a una capacitacion."""
    capacitacion = db.query(Capacitacion).filter(Capacitacion.id == capacitacion_id).first()
    if not capacitacion:
        raise HTTPException(status_code=404, detail="Capacitacion no encontrada")

    trabajador_ids = body.get("trabajador_ids", [])
    if not trabajador_ids:
        raise HTTPException(status_code=400, detail="Debe enviar al menos un trabajador_id")

    asignados = 0
    for tid in trabajador_ids:
        # Check if already assigned
        existing = (
            db.query(CapacitacionTrabajador)
            .filter(
                CapacitacionTrabajador.capacitacion_id == capacitacion_id,
                CapacitacionTrabajador.trabajador_id == tid,
            )
            .first()
        )
        if not existing:
            ct = CapacitacionTrabajador(
                capacitacion_id=capacitacion_id,
                trabajador_id=tid,
            )
            db.add(ct)
            asignados += 1

    db.commit()
    return {"detail": f"{asignados} trabajadores asignados"}


@router.get("/{capacitacion_id}/trabajadores")
def listar_trabajadores_capacitacion(
    capacitacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Lista trabajadores asignados a una capacitacion con su progreso."""
    capacitacion = db.query(Capacitacion).filter(Capacitacion.id == capacitacion_id).first()
    if not capacitacion:
        raise HTTPException(status_code=404, detail="Capacitacion no encontrada")

    asignaciones = (
        db.query(CapacitacionTrabajador, Postulante)
        .join(Postulante, CapacitacionTrabajador.trabajador_id == Postulante.id)
        .filter(CapacitacionTrabajador.capacitacion_id == capacitacion_id)
        .all()
    )

    result = []
    for ct, postulante in asignaciones:
        result.append({
            "id": ct.id,
            "trabajador_id": ct.trabajador_id,
            "nombre": postulante.nombre,
            "cumplimiento": ct.cumplimiento,
            "fecha_completado": ct.fecha_completado,
            "certificado_url": ct.certificado_url,
        })

    return result
