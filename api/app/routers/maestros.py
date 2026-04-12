from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..models.database import get_db
from ..models.maestro import MaestroArea, MaestroCargo
from ..models.usuario import Usuario
from ..schemas.maestro import (
    AreaCreate, AreaUpdate, AreaResponse,
    CargoCreate, CargoUpdate, CargoResponse,
)
from ..auth.dependencies import require_role

router = APIRouter(tags=["Maestros"])


# ── Areas ──────────────────────────────────────────────

@router.get("/areas", response_model=list[AreaResponse])
def list_areas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "evaluador"])),
):
    return db.query(MaestroArea).filter(MaestroArea.activa == True).order_by(MaestroArea.nombre).all()


@router.post("/areas", response_model=AreaResponse, status_code=201)
def create_area(
    data: AreaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    area = MaestroArea(nombre=data.nombre, descripcion=data.descripcion)
    db.add(area)
    try:
        db.commit()
        db.refresh(area)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ya existe un area con ese nombre")
    return area


@router.put("/areas/{area_id}", response_model=AreaResponse)
def update_area(
    area_id: int,
    data: AreaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    area = db.query(MaestroArea).filter(MaestroArea.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area no encontrada")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(area, key, value)
    try:
        db.commit()
        db.refresh(area)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ya existe un area con ese nombre")
    return area


@router.delete("/areas/{area_id}")
def delete_area(
    area_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    area = db.query(MaestroArea).filter(MaestroArea.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area no encontrada")
    area.activa = False
    db.commit()
    return {"message": "Area desactivada correctamente"}


# ── Cargos ─────────────────────────────────────────────

def _cargo_to_response(cargo: MaestroCargo) -> dict:
    return {
        "id": cargo.id,
        "nombre": cargo.nombre,
        "area_id": cargo.area_id,
        "area_nombre": cargo.area.nombre if cargo.area else None,
        "descripcion": cargo.descripcion,
        "activo": cargo.activo,
        "fecha_creacion": cargo.fecha_creacion,
    }


@router.get("/cargos", response_model=list[CargoResponse])
def list_cargos(
    area_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "evaluador"])),
):
    query = db.query(MaestroCargo).filter(MaestroCargo.activo == True)
    if area_id:
        query = query.filter(MaestroCargo.area_id == area_id)
    cargos = query.order_by(MaestroCargo.nombre).all()
    return [_cargo_to_response(c) for c in cargos]


@router.get("/cargos-por-area/{area_id}", response_model=list[CargoResponse])
def cargos_por_area(
    area_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "evaluador"])),
):
    cargos = (
        db.query(MaestroCargo)
        .filter(MaestroCargo.area_id == area_id, MaestroCargo.activo == True)
        .order_by(MaestroCargo.nombre)
        .all()
    )
    return [_cargo_to_response(c) for c in cargos]


@router.post("/cargos", response_model=CargoResponse, status_code=201)
def create_cargo(
    data: CargoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    area = db.query(MaestroArea).filter(MaestroArea.id == data.area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area no encontrada")
    cargo = MaestroCargo(nombre=data.nombre, area_id=data.area_id, descripcion=data.descripcion)
    db.add(cargo)
    try:
        db.commit()
        db.refresh(cargo)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ya existe un cargo con ese nombre")
    return _cargo_to_response(cargo)


@router.put("/cargos/{cargo_id}", response_model=CargoResponse)
def update_cargo(
    cargo_id: int,
    data: CargoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    cargo = db.query(MaestroCargo).filter(MaestroCargo.id == cargo_id).first()
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo no encontrado")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cargo, key, value)
    try:
        db.commit()
        db.refresh(cargo)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ya existe un cargo con ese nombre")
    return _cargo_to_response(cargo)


@router.delete("/cargos/{cargo_id}")
def delete_cargo(
    cargo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    cargo = db.query(MaestroCargo).filter(MaestroCargo.id == cargo_id).first()
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo no encontrado")
    cargo.activo = False
    db.commit()
    return {"message": "Cargo desactivado correctamente"}
