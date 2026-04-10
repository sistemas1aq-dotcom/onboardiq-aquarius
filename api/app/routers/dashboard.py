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

router = APIRouter(tags=["Dashboard"])


@router.get("/stats")
def get_stats(
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

    aprobados = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.estado == "Aprobado")
        .scalar()
        or 0
    )

    rechazados = (
        db.query(func.count(Postulante.id))
        .filter(Postulante.estado == "Rechazado")
        .scalar()
        or 0
    )

    documentos_pendientes = (
        db.query(func.count(Documento.id))
        .filter(Documento.estado == "pending")
        .scalar()
        or 0
    )

    entrevistas_programadas = (
        db.query(func.count(Entrevista.id))
        .filter(Entrevista.estado == "programada")
        .scalar()
        or 0
    )

    evaluaciones_pendientes = (
        db.query(func.count(EvaluacionPostulante.id))
        .filter(EvaluacionPostulante.estado == "pendiente")
        .scalar()
        or 0
    )

    total_usuarios = db.query(func.count(Usuario.id)).scalar() or 0

    return {
        "total_postulantes": total_postulantes,
        "en_evaluacion": en_evaluacion,
        "aprobados": aprobados,
        "rechazados": rechazados,
        "documentos_pendientes": documentos_pendientes,
        "entrevistas_programadas": entrevistas_programadas,
        "evaluaciones_pendientes": evaluaciones_pendientes,
        "total_usuarios": total_usuarios,
    }


@router.get("/charts")
def get_charts(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # Postulantes por estado
    estados = (
        db.query(Postulante.estado, func.count(Postulante.id))
        .group_by(Postulante.estado)
        .all()
    )
    postulantes_por_estado = [
        {"estado": estado, "cantidad": cantidad} for estado, cantidad in estados
    ]

    # Postulantes por puesto (top 10)
    puestos = (
        db.query(Postulante.puesto, func.count(Postulante.id))
        .group_by(Postulante.puesto)
        .order_by(func.count(Postulante.id).desc())
        .limit(10)
        .all()
    )
    postulantes_por_puesto = [
        {"puesto": puesto, "cantidad": cantidad} for puesto, cantidad in puestos
    ]

    # Postulantes por riesgo
    riesgos = (
        db.query(Postulante.riesgo, func.count(Postulante.id))
        .group_by(Postulante.riesgo)
        .all()
    )
    postulantes_por_riesgo = [
        {"riesgo": riesgo, "cantidad": cantidad} for riesgo, cantidad in riesgos
    ]

    # Usuarios por rol
    roles = (
        db.query(Usuario.rol, func.count(Usuario.id))
        .group_by(Usuario.rol)
        .all()
    )
    usuarios_por_rol = [
        {"rol": rol, "cantidad": cantidad} for rol, cantidad in roles
    ]

    # Documentos por estado
    doc_estados = (
        db.query(Documento.estado, func.count(Documento.id))
        .group_by(Documento.estado)
        .all()
    )
    documentos_por_estado = [
        {"estado": estado, "cantidad": cantidad} for estado, cantidad in doc_estados
    ]

    return {
        "postulantes_por_estado": postulantes_por_estado,
        "postulantes_por_puesto": postulantes_por_puesto,
        "postulantes_por_riesgo": postulantes_por_riesgo,
        "usuarios_por_rol": usuarios_por_rol,
        "documentos_por_estado": documentos_por_estado,
    }
