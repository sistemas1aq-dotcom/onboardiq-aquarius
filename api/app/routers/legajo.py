from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.postulante import Postulante, FichaPersonal
from ..models.evaluacion import EvaluacionPostulante, Evaluacion
from ..models.documento import Documento
from ..models.entrevista import Entrevista
from ..models.firma import FirmaDigital
from ..models.derechohabiente import Derechohabiente
from ..models.bancario import DatoBancario
from ..models.pensionario import RegimenPensionario
from ..models.capacitacion import CapacitacionTrabajador, Capacitacion
from ..models.ia_analisis import IAAnalisis
from ..auth.dependencies import get_current_user

router = APIRouter(tags=["Legajo Digital"])


@router.get("/{postulante_id}")
def get_legajo(
    postulante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    usuario = db.query(Usuario).filter(Usuario.id == postulante.usuario_id).first()

    ficha = (
        db.query(FichaPersonal)
        .filter(FichaPersonal.postulante_id == postulante_id)
        .first()
    )

    documentos = (
        db.query(Documento)
        .filter(Documento.postulante_id == postulante_id)
        .all()
    )

    entrevistas = (
        db.query(Entrevista)
        .filter(Entrevista.postulante_id == postulante_id)
        .all()
    )

    evaluaciones_raw = (
        db.query(EvaluacionPostulante)
        .filter(EvaluacionPostulante.postulante_id == postulante_id)
        .all()
    )
    evaluaciones = []
    for ep in evaluaciones_raw:
        ev = db.query(Evaluacion).filter(Evaluacion.id == ep.evaluacion_id).first()
        evaluaciones.append({
            "id": ep.id,
            "evaluacion_id": ep.evaluacion_id,
            "evaluacion_nombre": ev.nombre if ev else None,
            "evaluacion_tipo": ev.tipo if ev else None,
            "puntaje_obtenido": ep.puntaje_obtenido,
            "estado": ep.estado,
            "fecha_asignacion": ep.fecha_asignacion.isoformat() if ep.fecha_asignacion else None,
            "fecha_completado": ep.fecha_completado.isoformat() if ep.fecha_completado else None,
            "comentario_evaluador": ep.comentario_evaluador,
        })

    firmas = (
        db.query(FirmaDigital)
        .filter(FirmaDigital.usuario_id == postulante.usuario_id)
        .all()
    )

    derechohabientes = (
        db.query(Derechohabiente)
        .filter(Derechohabiente.trabajador_id == postulante_id)
        .all()
    )

    datos_bancarios = (
        db.query(DatoBancario)
        .filter(DatoBancario.trabajador_id == postulante_id)
        .first()
    )

    regimen_pensionario = (
        db.query(RegimenPensionario)
        .filter(RegimenPensionario.trabajador_id == postulante_id)
        .first()
    )

    capacitaciones_raw = (
        db.query(CapacitacionTrabajador)
        .filter(CapacitacionTrabajador.trabajador_id == postulante_id)
        .all()
    )
    capacitaciones = []
    for ct in capacitaciones_raw:
        cap = db.query(Capacitacion).filter(Capacitacion.id == ct.capacitacion_id).first()
        capacitaciones.append({
            "id": ct.id,
            "capacitacion_id": ct.capacitacion_id,
            "nombre": cap.nombre if cap else None,
            "cumplimiento": ct.cumplimiento,
            "fecha_completado": ct.fecha_completado.isoformat() if ct.fecha_completado else None,
            "certificado_url": ct.certificado_url,
        })

    analisis_ia = (
        db.query(IAAnalisis)
        .filter(IAAnalisis.postulante_id == postulante_id)
        .order_by(IAAnalisis.fecha.desc())
        .all()
    )

    docs_total = len(documentos)
    docs_ok = sum(1 for d in documentos if d.estado == "ok")

    return {
        "postulante": {
            "id": postulante.id,
            "puesto": postulante.puesto,
            "estado": postulante.estado,
            "avance": postulante.avance,
            "riesgo": postulante.riesgo,
            "fecha_registro": postulante.fecha_registro.isoformat() if postulante.fecha_registro else None,
            "comentarios": postulante.comentarios,
        },
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "dni": usuario.dni,
            "telefono": usuario.telefono,
        } if usuario else None,
        "ficha_personal": {
            "id": ficha.id,
            "nombres": ficha.nombres,
            "apellido_paterno": ficha.apellido_paterno,
            "apellido_materno": ficha.apellido_materno,
            "fecha_nacimiento": ficha.fecha_nacimiento.isoformat() if ficha.fecha_nacimiento else None,
            "lugar_nacimiento": ficha.lugar_nacimiento,
            "estado_civil": ficha.estado_civil,
            "genero": ficha.genero,
            "direccion": ficha.direccion,
            "distrito": ficha.distrito,
            "provincia": ficha.provincia,
            "departamento": ficha.departamento,
            "telefono": ficha.telefono,
            "grado_instruccion": ficha.grado_instruccion,
            "carrera": ficha.carrera,
            "universidad": ficha.universidad,
            "pretension_salarial": float(ficha.pretension_salarial) if ficha.pretension_salarial else None,
            "disponibilidad": ficha.disponibilidad,
            "modalidad_preferida": ficha.modalidad_preferida,
        } if ficha else None,
        "documentos": [
            {
                "id": d.id,
                "tipo": d.tipo,
                "nombre_archivo": d.nombre_archivo,
                "estado": d.estado,
                "requerido": d.requerido,
                "fecha_subida": d.fecha_subida.isoformat() if d.fecha_subida else None,
            }
            for d in documentos
        ],
        "documentos_resumen": {
            "total": docs_total,
            "aprobados": docs_ok,
            "pendientes": docs_total - docs_ok,
        },
        "entrevistas": [
            {
                "id": e.id,
                "tipo": e.tipo,
                "fecha": e.fecha.isoformat() if e.fecha else None,
                "hora": e.hora,
                "lugar": e.lugar,
                "evaluador_nombre": e.evaluador_nombre,
                "estado": e.estado,
                "notas": e.notas,
            }
            for e in entrevistas
        ],
        "evaluaciones": evaluaciones,
        "firmas": [
            {
                "id": f.id,
                "tipo_documento": f.tipo_documento,
                "fecha_firma": f.fecha_firma.isoformat() if f.fecha_firma else None,
            }
            for f in firmas
        ],
        "derechohabientes": [
            {
                "id": d.id,
                "nombre_completo": d.nombre_completo,
                "parentesco": d.parentesco,
                "dni": d.dni,
            }
            for d in derechohabientes
        ],
        "datos_bancarios": {
            "id": datos_bancarios.id,
            "tiene_cuenta": datos_bancarios.tiene_cuenta,
            "entidad": datos_bancarios.entidad,
            "tipo_cuenta": datos_bancarios.tipo_cuenta,
            "numero_cuenta": datos_bancarios.numero_cuenta,
            "cci": datos_bancarios.cci,
        } if datos_bancarios else None,
        "regimen_pensionario": {
            "id": regimen_pensionario.id,
            "tipo": regimen_pensionario.tipo,
            "entidad": regimen_pensionario.entidad,
            "cuspp": regimen_pensionario.cuspp,
            "primer_trabajo": regimen_pensionario.primer_trabajo,
        } if regimen_pensionario else None,
        "capacitaciones": capacitaciones,
        "analisis_ia": [
            {
                "id": a.id,
                "tipo": a.tipo,
                "resultado": a.resultado,
                "score": a.score,
                "fecha": a.fecha.isoformat() if a.fecha else None,
            }
            for a in analisis_ia
        ],
    }
