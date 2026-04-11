from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.postulante import Postulante
from ..models.evaluacion_desempeno import EvaluacionDesempeno, CriterioEvaluacion, EvaluacionDetalle
from ..auth.dependencies import get_current_user, require_role
from ..schemas.evaluacion_desempeno import (
    EvalDesempenoCreate,
    EvalDesempenoUpdate,
    EvalDesempenoResponse,
    CriterioCreate,
    CriterioResponse,
)

router = APIRouter()


@router.get("/criterios", response_model=list[CriterioResponse])
def listar_criterios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista criterios de evaluacion activos."""
    return db.query(CriterioEvaluacion).filter(CriterioEvaluacion.activo == True).all()


@router.post("/criterios", response_model=CriterioResponse)
def crear_criterio(
    data: CriterioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Crea un criterio de evaluacion (admin)."""
    criterio = CriterioEvaluacion(
        nombre=data.nombre,
        descripcion=data.descripcion,
        peso=data.peso,
        categoria=data.categoria,
        activo=data.activo if data.activo is not None else True,
    )
    db.add(criterio)
    db.commit()
    db.refresh(criterio)
    return criterio


@router.get("/mis-evaluaciones")
def mis_evaluaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista evaluaciones del trabajador actual (portal)."""
    postulante = db.query(Postulante).filter(Postulante.usuario_id == current_user.id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="No tiene un registro de postulante asociado")

    evaluaciones = (
        db.query(EvaluacionDesempeno)
        .filter(EvaluacionDesempeno.trabajador_id == postulante.id)
        .order_by(EvaluacionDesempeno.id.desc())
        .all()
    )

    result = []
    for ev in evaluaciones:
        evaluador = db.query(Usuario).filter(Usuario.id == ev.evaluador_id).first()
        detalles = (
            db.query(EvaluacionDetalle)
            .filter(EvaluacionDetalle.evaluacion_desempeno_id == ev.id)
            .all()
        )
        result.append({
            "id": ev.id,
            "trabajador_id": ev.trabajador_id,
            "evaluador_id": ev.evaluador_id,
            "evaluador_nombre": evaluador.nombre if evaluador else None,
            "periodo": ev.periodo,
            "tipo": ev.tipo,
            "fecha_evaluacion": ev.fecha_evaluacion,
            "puntaje_general": float(ev.puntaje_general) if ev.puntaje_general else 0,
            "estado": ev.estado,
            "comentarios_generales": ev.comentarios_generales,
            "fecha_creacion": ev.fecha_creacion,
            "detalles": [
                {
                    "id": d.id,
                    "criterio_id": d.criterio_id,
                    "puntaje": d.puntaje,
                    "comentario": d.comentario,
                }
                for d in detalles
            ],
        })

    return result


@router.get("/", response_model=list[EvalDesempenoResponse])
def listar_evaluaciones(
    periodo: Optional[str] = Query(None),
    trabajador_id: Optional[int] = Query(None),
    estado: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Lista evaluaciones de desempeno (admin)."""
    query = db.query(EvaluacionDesempeno)
    if periodo:
        query = query.filter(EvaluacionDesempeno.periodo == periodo)
    if trabajador_id:
        query = query.filter(EvaluacionDesempeno.trabajador_id == trabajador_id)
    if estado:
        query = query.filter(EvaluacionDesempeno.estado == estado)

    evaluaciones = query.order_by(EvaluacionDesempeno.id.desc()).offset(skip).limit(limit).all()

    result = []
    for ev in evaluaciones:
        trabajador = db.query(Postulante).filter(Postulante.id == ev.trabajador_id).first()
        evaluador = db.query(Usuario).filter(Usuario.id == ev.evaluador_id).first()
        result.append(EvalDesempenoResponse(
            id=ev.id,
            trabajador_id=ev.trabajador_id,
            evaluador_id=ev.evaluador_id,
            periodo=ev.periodo,
            tipo=ev.tipo,
            fecha_evaluacion=ev.fecha_evaluacion,
            puntaje_general=float(ev.puntaje_general) if ev.puntaje_general else 0,
            estado=ev.estado,
            comentarios_generales=ev.comentarios_generales,
            fecha_creacion=ev.fecha_creacion,
            trabajador_nombre=trabajador.nombre if trabajador else None,
            evaluador_nombre=evaluador.nombre if evaluador else None,
        ))

    return result


@router.post("/", response_model=EvalDesempenoResponse)
def crear_evaluacion(
    data: EvalDesempenoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Crea una evaluacion de desempeno."""
    evaluacion = EvaluacionDesempeno(
        trabajador_id=data.trabajador_id,
        evaluador_id=data.evaluador_id,
        periodo=data.periodo,
        tipo=data.tipo,
        fecha_evaluacion=data.fecha_evaluacion or date.today(),
        comentarios_generales=data.comentarios_generales,
        estado="borrador",
    )
    db.add(evaluacion)
    db.commit()
    db.refresh(evaluacion)

    trabajador = db.query(Postulante).filter(Postulante.id == evaluacion.trabajador_id).first()
    evaluador = db.query(Usuario).filter(Usuario.id == evaluacion.evaluador_id).first()

    return EvalDesempenoResponse(
        id=evaluacion.id,
        trabajador_id=evaluacion.trabajador_id,
        evaluador_id=evaluacion.evaluador_id,
        periodo=evaluacion.periodo,
        tipo=evaluacion.tipo,
        fecha_evaluacion=evaluacion.fecha_evaluacion,
        puntaje_general=float(evaluacion.puntaje_general) if evaluacion.puntaje_general else 0,
        estado=evaluacion.estado,
        comentarios_generales=evaluacion.comentarios_generales,
        fecha_creacion=evaluacion.fecha_creacion,
        trabajador_nombre=trabajador.nombre if trabajador else None,
        evaluador_nombre=evaluador.nombre if evaluador else None,
    )


@router.get("/{evaluacion_id}")
def obtener_evaluacion(
    evaluacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene detalle de una evaluacion con criterios y detalles."""
    evaluacion = db.query(EvaluacionDesempeno).filter(EvaluacionDesempeno.id == evaluacion_id).first()
    if not evaluacion:
        raise HTTPException(status_code=404, detail="Evaluacion no encontrada")

    detalles = (
        db.query(EvaluacionDetalle)
        .filter(EvaluacionDetalle.evaluacion_desempeno_id == evaluacion_id)
        .all()
    )
    trabajador = db.query(Postulante).filter(Postulante.id == evaluacion.trabajador_id).first()
    evaluador = db.query(Usuario).filter(Usuario.id == evaluacion.evaluador_id).first()

    return {
        "id": evaluacion.id,
        "trabajador_id": evaluacion.trabajador_id,
        "evaluador_id": evaluacion.evaluador_id,
        "trabajador_nombre": trabajador.nombre if trabajador else None,
        "evaluador_nombre": evaluador.nombre if evaluador else None,
        "periodo": evaluacion.periodo,
        "tipo": evaluacion.tipo,
        "fecha_evaluacion": evaluacion.fecha_evaluacion,
        "puntaje_general": float(evaluacion.puntaje_general) if evaluacion.puntaje_general else 0,
        "estado": evaluacion.estado,
        "comentarios_generales": evaluacion.comentarios_generales,
        "fecha_creacion": evaluacion.fecha_creacion,
        "detalles": [
            {
                "id": d.id,
                "criterio_id": d.criterio_id,
                "puntaje": d.puntaje,
                "comentario": d.comentario,
            }
            for d in detalles
        ],
    }


@router.put("/{evaluacion_id}")
def actualizar_evaluacion(
    evaluacion_id: int,
    data: EvalDesempenoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Actualiza puntajes de una evaluacion. Auto-calcula puntaje_general."""
    evaluacion = db.query(EvaluacionDesempeno).filter(EvaluacionDesempeno.id == evaluacion_id).first()
    if not evaluacion:
        raise HTTPException(status_code=404, detail="Evaluacion no encontrada")

    if data.comentarios_generales is not None:
        evaluacion.comentarios_generales = data.comentarios_generales

    if data.estado is not None:
        evaluacion.estado = data.estado

    # Update detalles
    if data.detalles:
        # Remove existing detalles
        db.query(EvaluacionDetalle).filter(
            EvaluacionDetalle.evaluacion_desempeno_id == evaluacion_id
        ).delete()

        for det in data.detalles:
            detalle = EvaluacionDetalle(
                evaluacion_desempeno_id=evaluacion_id,
                criterio_id=det.criterio_id,
                puntaje=max(0, min(5, det.puntaje)),  # clamp 0-5
                comentario=det.comentario,
            )
            db.add(detalle)

        db.flush()

        # Auto-calculate puntaje_general as weighted average
        detalles = (
            db.query(EvaluacionDetalle)
            .filter(EvaluacionDetalle.evaluacion_desempeno_id == evaluacion_id)
            .all()
        )

        suma_ponderada = 0
        suma_pesos = 0
        for d in detalles:
            criterio = db.query(CriterioEvaluacion).filter(CriterioEvaluacion.id == d.criterio_id).first()
            peso = float(criterio.peso) if criterio and criterio.peso else 1.0
            suma_ponderada += (d.puntaje / 5.0) * peso
            suma_pesos += peso

        if suma_pesos > 0:
            evaluacion.puntaje_general = round((suma_ponderada / suma_pesos) * 100, 2)
        else:
            evaluacion.puntaje_general = 0

    db.commit()
    db.refresh(evaluacion)

    return {
        "id": evaluacion.id,
        "puntaje_general": float(evaluacion.puntaje_general) if evaluacion.puntaje_general else 0,
        "estado": evaluacion.estado,
        "detail": "Evaluacion actualizada",
    }


@router.delete("/{evaluacion_id}")
def eliminar_evaluacion(
    evaluacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Elimina una evaluacion de desempeno."""
    evaluacion = db.query(EvaluacionDesempeno).filter(EvaluacionDesempeno.id == evaluacion_id).first()
    if not evaluacion:
        raise HTTPException(status_code=404, detail="Evaluacion no encontrada")

    # Delete detalles first
    db.query(EvaluacionDetalle).filter(
        EvaluacionDetalle.evaluacion_desempeno_id == evaluacion_id
    ).delete()

    db.delete(evaluacion)
    db.commit()
    return {"detail": "Evaluacion eliminada"}
