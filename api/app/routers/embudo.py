from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.postulante import Postulante
from ..models.evaluacion import EvaluacionPostulante
from ..models.documento import Documento
from ..models.entrevista import Entrevista
from ..auth.dependencies import get_current_user

router = APIRouter(tags=["Embudo de Seleccion"])


@router.get("/stats")
def get_funnel_stats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    total_postulantes = db.query(func.count(Postulante.id)).scalar() or 0

    en_evaluacion = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.estado == "En Evaluacion")
        .scalar()
        or 0
    )

    en_documentacion = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.estado == "Documentacion")
        .scalar()
        or 0
    )

    en_entrevista = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.estado == "Entrevista")
        .scalar()
        or 0
    )

    aprobados = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.estado == "Aprobado")
        .scalar()
        or 0
    )

    contratados = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.estado == "Contratado")
        .scalar()
        or 0
    )

    rechazados = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.estado == "Rechazado")
        .scalar()
        or 0
    )

    # Evaluation pass rate
    eval_completadas = (
        db.query(func.count(EvaluacionPostulante.id))
        .filter(EvaluacionPostulante.estado == "completada")
        .scalar()
        or 0
    )
    eval_aprobadas = (
        db.query(func.count(EvaluacionPostulante.id))
        .filter(
            EvaluacionPostulante.estado == "completada",
            EvaluacionPostulante.puntaje_obtenido >= 60,
        )
        .scalar()
        or 0
    )

    # Document completion rate
    docs_total = db.query(func.count(Documento.id)).scalar() or 0
    docs_ok = (
        db.query(func.count(Documento.id))
        .filter(Documento.estado == "ok")
        .scalar()
        or 0
    )

    # Risk breakdown
    riesgo_bajo = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.riesgo == "bajo")
        .scalar()
        or 0
    )
    riesgo_medio = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.riesgo == "medio")
        .scalar()
        or 0
    )
    riesgo_alto = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.riesgo == "alto")
        .scalar()
        or 0
    )

    funnel_steps = [
        {"etapa": "Postulacion", "cantidad": total_postulantes, "orden": 1},
        {"etapa": "En Evaluacion", "cantidad": en_evaluacion, "orden": 2},
        {"etapa": "Documentacion", "cantidad": en_documentacion, "orden": 3},
        {"etapa": "Entrevista", "cantidad": en_entrevista, "orden": 4},
        {"etapa": "Aprobado", "cantidad": aprobados, "orden": 5},
        {"etapa": "Contratado", "cantidad": contratados, "orden": 6},
    ]

    tasa_conversion = round((contratados / total_postulantes * 100), 1) if total_postulantes > 0 else 0
    tasa_rechazo = round((rechazados / total_postulantes * 100), 1) if total_postulantes > 0 else 0
    tasa_aprobacion_eval = round((eval_aprobadas / eval_completadas * 100), 1) if eval_completadas > 0 else 0
    tasa_documentos = round((docs_ok / docs_total * 100), 1) if docs_total > 0 else 0

    return {
        "embudo": funnel_steps,
        "rechazados": rechazados,
        "tasas": {
            "conversion": tasa_conversion,
            "rechazo": tasa_rechazo,
            "aprobacion_evaluaciones": tasa_aprobacion_eval,
            "completitud_documentos": tasa_documentos,
        },
        "riesgos": {
            "bajo": riesgo_bajo,
            "medio": riesgo_medio,
            "alto": riesgo_alto,
        },
    }
