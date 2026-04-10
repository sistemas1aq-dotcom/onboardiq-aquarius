import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.postulante import Postulante, FichaPersonal
from ..models.ia_analisis import IAAnalisis
from ..schemas.ia import (
    CVAnalysisRequest,
    ScoringRequest,
    ChatRequest,
    IAAnalysisResponse,
    ChatResponse,
)
from ..auth.dependencies import get_current_user
from ..ai import service as ai_service

router = APIRouter(tags=["Inteligencia Artificial"])


def _get_postulante_data(db: Session, postulante_id: int) -> dict:
    postulante = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    ficha = (
        db.query(FichaPersonal)
        .filter(FichaPersonal.postulante_id == postulante_id)
        .first()
    )

    usuario = db.query(Usuario).filter(Usuario.id == postulante.usuario_id).first()

    data = {
        "nombre": usuario.nombre if usuario else None,
        "email": usuario.email if usuario else None,
        "puesto": postulante.puesto,
        "estado": postulante.estado,
        "avance": postulante.avance,
    }

    if ficha:
        data.update({
            "nombres": ficha.nombres,
            "apellido_paterno": ficha.apellido_paterno,
            "apellido_materno": ficha.apellido_materno,
            "grado_instruccion": ficha.grado_instruccion,
            "carrera": ficha.carrera,
            "universidad": ficha.universidad,
            "anio_egreso": ficha.anio_egreso,
            "experiencia_laboral": ficha.experiencia_laboral,
            "idiomas": ficha.idiomas,
            "habilidades": ficha.habilidades,
            "pretension_salarial": float(ficha.pretension_salarial) if ficha.pretension_salarial else None,
            "disponibilidad": ficha.disponibilidad,
        })

    return data


@router.post("/analizar-cv", response_model=IAAnalysisResponse)
def analizar_cv(
    data: CVAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = db.query(Postulante).filter(Postulante.id == data.postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    puesto = data.puesto or postulante.puesto

    try:
        resultado = ai_service.analyze_cv(data.cv_text, puesto)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en analisis IA: {str(e)}")

    score = resultado.get("score", 0)
    analisis = IAAnalisis(
        postulante_id=data.postulante_id,
        tipo="cv_analysis",
        resultado=json.dumps(resultado, ensure_ascii=False),
        score=score,
    )
    db.add(analisis)
    db.commit()
    db.refresh(analisis)

    return IAAnalysisResponse(
        id=analisis.id,
        postulante_id=analisis.postulante_id,
        tipo=analisis.tipo,
        resultado=resultado,
        score=analisis.score,
    )


@router.post("/scoring", response_model=IAAnalysisResponse)
def scoring(
    data: ScoringRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante_data = _get_postulante_data(db, data.postulante_id)

    try:
        resultado = ai_service.calculate_scoring(postulante_data, data.puesto)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en scoring IA: {str(e)}")

    score = resultado.get("score_general", 0)
    analisis = IAAnalisis(
        postulante_id=data.postulante_id,
        tipo="scoring",
        resultado=json.dumps(resultado, ensure_ascii=False),
        score=score,
    )
    db.add(analisis)
    db.commit()
    db.refresh(analisis)

    return IAAnalysisResponse(
        id=analisis.id,
        postulante_id=analisis.postulante_id,
        tipo=analisis.tipo,
        resultado=resultado,
        score=analisis.score,
    )


@router.get("/insights/{postulante_id}", response_model=IAAnalysisResponse)
def get_insights(
    postulante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante_data = _get_postulante_data(db, postulante_id)

    try:
        resultado = ai_service.get_insights(postulante_data)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en insights IA: {str(e)}")

    analisis = IAAnalisis(
        postulante_id=postulante_id,
        tipo="insights",
        resultado=json.dumps(resultado, ensure_ascii=False),
    )
    db.add(analisis)
    db.commit()
    db.refresh(analisis)

    return IAAnalysisResponse(
        id=analisis.id,
        postulante_id=analisis.postulante_id,
        tipo=analisis.tipo,
        resultado=resultado,
        score=analisis.score,
    )


@router.post("/chat", response_model=ChatResponse)
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    try:
        response_text = ai_service.chat_response(data.message, data.context)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en chat IA: {str(e)}")

    return ChatResponse(response=response_text)
