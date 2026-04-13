from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.evaluacion import Evaluacion, Pregunta, EvaluacionPostulante, Respuesta
from ..models.postulante import Postulante
from ..schemas.evaluacion import (
    EvaluacionCreate,
    EvaluacionResponse,
    PreguntaCreate,
    PreguntaResponse,
    AsignarEvaluacionRequest,
    EvaluacionSubmitRequest,
    EvaluacionPostulanteResponse,
)
from ..auth.dependencies import get_current_user

router = APIRouter(tags=["Evaluaciones"])


# --- CRUD Evaluaciones ---

@router.get("/", response_model=list[EvaluacionResponse])
def list_evaluaciones(
    tipo: Optional[str] = None,
    activa: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = db.query(Evaluacion)
    if tipo:
        query = query.filter(Evaluacion.tipo == tipo)
    if activa is not None:
        query = query.filter(Evaluacion.activa == activa)

    evaluaciones = query.order_by(Evaluacion.id.desc()).all()

    # Contar preguntas por evaluacion en una sola query
    counts = dict(
        db.query(Pregunta.evaluacion_id, func.count(Pregunta.id))
        .group_by(Pregunta.evaluacion_id)
        .all()
    )

    result = []
    for e in evaluaciones:
        resp = EvaluacionResponse(
            id=e.id,
            nombre=e.nombre,
            tipo=e.tipo,
            descripcion=e.descripcion,
            duracion_minutos=e.duracion_minutos,
            puntaje_minimo=e.puntaje_minimo,
            activa=e.activa,
            fecha_creacion=e.fecha_creacion,
            preguntas_count=counts.get(e.id, 0),
        )
        result.append(resp)
    return result


@router.get("/{evaluacion_id}/postulantes")
def get_postulantes_evaluacion(
    evaluacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Get all postulantes assigned to this evaluation with their scores and approval info."""
    from ..models.aprobador import AprobadorPostulante

    evaluacion = db.query(Evaluacion).filter(Evaluacion.id == evaluacion_id).first()
    if not evaluacion:
        raise HTTPException(status_code=404, detail="Evaluacion no encontrada")

    asignaciones = (
        db.query(EvaluacionPostulante)
        .filter(EvaluacionPostulante.evaluacion_id == evaluacion_id)
        .all()
    )

    result = []
    for ep in asignaciones:
        postulante = db.query(Postulante).filter(Postulante.id == ep.postulante_id).first()
        if not postulante:
            continue
        usr = db.query(Usuario).filter(Usuario.id == postulante.usuario_id).first()
        nombre = usr.nombre if usr else ""
        dni = usr.dni if usr else ""

        # Find the aprobador record: first check postulante-specific, then evaluation-level (postulante_id=None)
        from sqlalchemy import or_
        mi_aprobador = (
            db.query(AprobadorPostulante)
            .filter(
                AprobadorPostulante.evaluacion_id == evaluacion_id,
                or_(
                    AprobadorPostulante.postulante_id == ep.postulante_id,
                    AprobadorPostulante.postulante_id == None,
                ),
                AprobadorPostulante.usuario_id == current_user.id,
                AprobadorPostulante.estado == "pendiente",
            )
            .first()
        )

        # Check if this user is the active approver (all previous levels approved)
        is_active_approver = False
        aprobador_id = None
        if mi_aprobador:
            anteriores = (
                db.query(AprobadorPostulante)
                .filter(
                    AprobadorPostulante.evaluacion_id == evaluacion_id,
                    or_(
                        AprobadorPostulante.postulante_id == ep.postulante_id,
                        AprobadorPostulante.postulante_id == None,
                    ),
                    AprobadorPostulante.orden < mi_aprobador.orden,
                )
                .all()
            )
            todos_aprobados = all(a.estado == "aprobado" for a in anteriores) if anteriores else True
            if todos_aprobados:
                is_active_approver = True
                aprobador_id = mi_aprobador.id

        # Get all aprobadores: postulante-specific OR evaluation-level
        aprobadores_chain = (
            db.query(AprobadorPostulante)
            .filter(
                AprobadorPostulante.evaluacion_id == evaluacion_id,
                or_(
                    AprobadorPostulante.postulante_id == ep.postulante_id,
                    AprobadorPostulante.postulante_id == None,
                ),
            )
            .order_by(AprobadorPostulante.orden)
            .all()
        )
        chain = []
        for ap in aprobadores_chain:
            ap_user = db.query(Usuario).filter(Usuario.id == ap.usuario_id).first()
            chain.append({
                "id": ap.id,
                "usuario_nombre": ap_user.nombre if ap_user else "",
                "orden": ap.orden,
                "estado": ap.estado,
                "comentario": ap.comentario,
            })

        result.append({
            "postulante_id": ep.postulante_id,
            "nombre": nombre,
            "dni": dni,
            "puesto": postulante.puesto,
            "puntaje_obtenido": ep.puntaje_obtenido,
            "estado": ep.estado,
            "fecha_asignacion": ep.fecha_asignacion.isoformat() if ep.fecha_asignacion else None,
            "fecha_completado": ep.fecha_completado.isoformat() if ep.fecha_completado else None,
            "evaluacion_postulante_id": ep.id,
            "is_active_approver": is_active_approver,
            "aprobador_id": aprobador_id,
            "aprobadores": chain,
        })

    return result


@router.get("/{evaluacion_id}", response_model=EvaluacionResponse)
def get_evaluacion(
    evaluacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    e = db.query(Evaluacion).filter(Evaluacion.id == evaluacion_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Evaluacion no encontrada")
    pc = db.query(func.count(Pregunta.id)).filter(Pregunta.evaluacion_id == e.id).scalar()
    return EvaluacionResponse(
        id=e.id,
        nombre=e.nombre,
        tipo=e.tipo,
        descripcion=e.descripcion,
        duracion_minutos=e.duracion_minutos,
        puntaje_minimo=e.puntaje_minimo,
        activa=e.activa,
        fecha_creacion=e.fecha_creacion,
        preguntas_count=pc or 0,
    )


@router.post("/", response_model=EvaluacionResponse, status_code=status.HTTP_201_CREATED)
def create_evaluacion(
    data: EvaluacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    evaluacion = Evaluacion(
        nombre=data.nombre,
        tipo=data.tipo,
        descripcion=data.descripcion,
        duracion_minutos=data.duracion_minutos,
        puntaje_minimo=data.puntaje_minimo,
    )
    db.add(evaluacion)
    db.commit()
    db.refresh(evaluacion)
    return EvaluacionResponse(
        id=evaluacion.id,
        nombre=evaluacion.nombre,
        tipo=evaluacion.tipo,
        descripcion=evaluacion.descripcion,
        duracion_minutos=evaluacion.duracion_minutos,
        puntaje_minimo=evaluacion.puntaje_minimo,
        activa=evaluacion.activa,
        fecha_creacion=evaluacion.fecha_creacion,
        preguntas_count=0,
    )


@router.put("/{evaluacion_id}", response_model=EvaluacionResponse)
def update_evaluacion(
    evaluacion_id: int,
    data: EvaluacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    evaluacion = db.query(Evaluacion).filter(Evaluacion.id == evaluacion_id).first()
    if not evaluacion:
        raise HTTPException(status_code=404, detail="Evaluacion no encontrada")
    evaluacion.nombre = data.nombre
    evaluacion.tipo = data.tipo
    evaluacion.descripcion = data.descripcion
    evaluacion.duracion_minutos = data.duracion_minutos
    evaluacion.puntaje_minimo = data.puntaje_minimo
    db.commit()
    db.refresh(evaluacion)
    return EvaluacionResponse(
        id=evaluacion.id,
        nombre=evaluacion.nombre,
        tipo=evaluacion.tipo,
        descripcion=evaluacion.descripcion,
        duracion_minutos=evaluacion.duracion_minutos,
        puntaje_minimo=evaluacion.puntaje_minimo,
        activa=evaluacion.activa,
        fecha_creacion=evaluacion.fecha_creacion,
        preguntas_count=db.query(func.count(Pregunta.id)).filter(Pregunta.evaluacion_id == evaluacion.id).scalar() or 0,
    )


@router.delete("/{evaluacion_id}")
def delete_evaluacion(
    evaluacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    evaluacion = db.query(Evaluacion).filter(Evaluacion.id == evaluacion_id).first()
    if not evaluacion:
        raise HTTPException(status_code=404, detail="Evaluacion no encontrada")
    # Borrar dependencias primero
    db.query(Pregunta).filter(Pregunta.evaluacion_id == evaluacion_id).delete()
    db.query(EvaluacionPostulante).filter(EvaluacionPostulante.evaluacion_id == evaluacion_id).delete()
    from ..models.aprobador import AprobadorPostulante
    db.query(AprobadorPostulante).filter(AprobadorPostulante.evaluacion_id == evaluacion_id).delete()
    db.delete(evaluacion)
    db.commit()
    return {"message": "Evaluacion eliminada correctamente"}


# --- CRUD Preguntas ---

@router.get("/{evaluacion_id}/preguntas", response_model=list[PreguntaResponse])
def list_preguntas(
    evaluacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    preguntas = (
        db.query(Pregunta)
        .filter(Pregunta.evaluacion_id == evaluacion_id)
        .order_by(Pregunta.orden)
        .all()
    )
    return preguntas


@router.post("/preguntas", response_model=PreguntaResponse, status_code=status.HTTP_201_CREATED)
def create_pregunta(
    data: PreguntaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    evaluacion = db.query(Evaluacion).filter(Evaluacion.id == data.evaluacion_id).first()
    if not evaluacion:
        raise HTTPException(status_code=404, detail="Evaluacion no encontrada")
    pregunta = Pregunta(
        evaluacion_id=data.evaluacion_id,
        pregunta=data.pregunta,
        opciones=data.opciones if isinstance(data.opciones, str) else str(data.opciones),
        respuesta_correcta=data.respuesta_correcta,
        puntaje=data.puntaje,
        orden=data.orden,
    )
    db.add(pregunta)
    db.commit()
    db.refresh(pregunta)
    return pregunta


@router.put("/preguntas/{pregunta_id}", response_model=PreguntaResponse)
def update_pregunta(
    pregunta_id: int,
    data: PreguntaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pregunta = db.query(Pregunta).filter(Pregunta.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    pregunta.pregunta = data.pregunta
    pregunta.opciones = data.opciones if isinstance(data.opciones, str) else str(data.opciones)
    pregunta.respuesta_correcta = data.respuesta_correcta
    pregunta.puntaje = data.puntaje
    pregunta.orden = data.orden
    db.commit()
    db.refresh(pregunta)
    return pregunta


@router.delete("/preguntas/{pregunta_id}")
def delete_pregunta(
    pregunta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pregunta = db.query(Pregunta).filter(Pregunta.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    db.delete(pregunta)
    db.commit()
    return {"message": "Pregunta eliminada correctamente"}


# --- Asignar y Submit ---

@router.post("/asignar", response_model=EvaluacionPostulanteResponse, status_code=status.HTTP_201_CREATED)
def asignar_evaluacion(
    data: AsignarEvaluacionRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    evaluacion = db.query(Evaluacion).filter(Evaluacion.id == data.evaluacion_id).first()
    if not evaluacion:
        raise HTTPException(status_code=404, detail="Evaluacion no encontrada")
    postulante = db.query(Postulante).filter(Postulante.id == data.postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    existing = (
        db.query(EvaluacionPostulante)
        .filter(
            EvaluacionPostulante.evaluacion_id == data.evaluacion_id,
            EvaluacionPostulante.postulante_id == data.postulante_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Esta evaluacion ya fue asignada a este postulante",
        )

    ep = EvaluacionPostulante(
        evaluacion_id=data.evaluacion_id,
        postulante_id=data.postulante_id,
        evaluador_id=data.evaluador_id,
    )
    db.add(ep)
    db.commit()
    db.refresh(ep)
    return EvaluacionPostulanteResponse(
        id=ep.id,
        evaluacion_id=ep.evaluacion_id,
        postulante_id=ep.postulante_id,
        evaluador_id=ep.evaluador_id,
        puntaje_obtenido=ep.puntaje_obtenido,
        estado=ep.estado,
        fecha_asignacion=ep.fecha_asignacion,
        fecha_completado=ep.fecha_completado,
        comentario_evaluador=ep.comentario_evaluador,
        evaluacion_nombre=evaluacion.nombre,
        evaluacion_tipo=evaluacion.tipo,
    )


@router.post("/submit")
def submit_evaluacion(
    data: EvaluacionSubmitRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    ep = (
        db.query(EvaluacionPostulante)
        .filter(EvaluacionPostulante.id == data.evaluacion_postulante_id)
        .first()
    )
    if not ep:
        raise HTTPException(status_code=404, detail="Asignacion no encontrada")
    if ep.estado == "completada":
        raise HTTPException(status_code=400, detail="Esta evaluacion ya fue completada")

    evaluacion = db.query(Evaluacion).filter(Evaluacion.id == ep.evaluacion_id).first()
    total_puntaje = 0
    puntaje_obtenido = 0

    for resp_data in data.respuestas:
        pregunta = db.query(Pregunta).filter(Pregunta.id == resp_data.pregunta_id).first()
        if not pregunta:
            continue
        es_correcta = resp_data.respuesta_seleccionada == pregunta.respuesta_correcta
        total_puntaje += pregunta.puntaje
        if es_correcta:
            puntaje_obtenido += pregunta.puntaje

        respuesta = Respuesta(
            evaluacion_postulante_id=ep.id,
            pregunta_id=resp_data.pregunta_id,
            respuesta_seleccionada=resp_data.respuesta_seleccionada,
            es_correcta=es_correcta,
        )
        db.add(respuesta)

    score = int((puntaje_obtenido / total_puntaje * 100)) if total_puntaje > 0 else 0
    ep.puntaje_obtenido = score
    ep.estado = "completada"
    ep.fecha_completado = datetime.now(timezone.utc)
    db.commit()

    return {
        "message": "Evaluacion completada",
        "puntaje_obtenido": score,
        "aprobado": score >= (evaluacion.puntaje_minimo if evaluacion else 60),
        "total_preguntas": len(data.respuestas),
    }


@router.get("/resultados/{postulante_id}", response_model=list[EvaluacionPostulanteResponse])
def get_resultados(
    postulante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    resultados = (
        db.query(EvaluacionPostulante)
        .filter(EvaluacionPostulante.postulante_id == postulante_id)
        .all()
    )
    result = []
    for ep in resultados:
        evaluacion = db.query(Evaluacion).filter(Evaluacion.id == ep.evaluacion_id).first()
        result.append(
            EvaluacionPostulanteResponse(
                id=ep.id,
                evaluacion_id=ep.evaluacion_id,
                postulante_id=ep.postulante_id,
                evaluador_id=ep.evaluador_id,
                puntaje_obtenido=ep.puntaje_obtenido,
                estado=ep.estado,
                fecha_asignacion=ep.fecha_asignacion,
                fecha_completado=ep.fecha_completado,
                comentario_evaluador=ep.comentario_evaluador,
                evaluacion_nombre=evaluacion.nombre if evaluacion else None,
                evaluacion_tipo=evaluacion.tipo if evaluacion else None,
            )
        )
    return result
