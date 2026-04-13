import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
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
from ..schemas.postulante import FichaPersonalBase, FichaPersonalResponse
from ..schemas.firma import FirmaCreate, FirmaResponse
from ..schemas.derechohabiente import DerechohabienteCreate, DerechohabienteResponse
from ..schemas.bancario import DatoBancarioCreate, DatoBancarioResponse
from ..schemas.pensionario import RegimenPensionarioCreate, RegimenPensionarioResponse
from ..auth.dependencies import get_current_user

router = APIRouter(tags=["Portal del Trabajador"])


def _get_postulante_for_user(db: Session, user: Usuario) -> Postulante:
    postulante = db.query(Postulante).filter(Postulante.usuario_id == user.id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="No tiene un registro de postulante asociado")
    return postulante


# --- Mi Ficha ---

@router.get("/mi-ficha", response_model=FichaPersonalResponse)
def get_mi_ficha(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    ficha = (
        db.query(FichaPersonal)
        .filter(FichaPersonal.postulante_id == postulante.id)
        .first()
    )
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha personal no encontrada")
    return ficha


@router.put("/mi-ficha", response_model=FichaPersonalResponse)
def update_mi_ficha(
    data: FichaPersonalBase,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    ficha = (
        db.query(FichaPersonal)
        .filter(FichaPersonal.postulante_id == postulante.id)
        .first()
    )
    if not ficha:
        ficha = FichaPersonal(postulante_id=postulante.id)
        db.add(ficha)

    update_data = data.model_dump(exclude_unset=True)

    # Manejar campo 'apellidos' del frontend → split a apellido_paterno/materno
    if 'apellidos' in update_data:
        apellidos = str(update_data.pop('apellidos', '')).strip()
        parts = apellidos.split(' ', 1)
        update_data['apellido_paterno'] = parts[0] if parts else ''
        update_data['apellido_materno'] = parts[1] if len(parts) > 1 else ''

    for key, value in update_data.items():
        if not hasattr(ficha, key):
            continue  # Skip fields not in the model
        if isinstance(value, (list, dict)):
            import json
            setattr(ficha, key, json.dumps(value, ensure_ascii=False))
        else:
            setattr(ficha, key, value)
    ficha.fecha_actualizacion = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ficha)
    return ficha


# --- Mis Evaluaciones ---

@router.get("/mis-evaluaciones")
def get_mis_evaluaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    evaluaciones = (
        db.query(EvaluacionPostulante)
        .filter(EvaluacionPostulante.postulante_id == postulante.id)
        .all()
    )
    result = []
    for ep in evaluaciones:
        ev = db.query(Evaluacion).filter(Evaluacion.id == ep.evaluacion_id).first()
        result.append({
            "id": ep.id,
            "evaluacion_id": ep.evaluacion_id,
            "evaluacion_nombre": ev.nombre if ev else None,
            "evaluacion_tipo": ev.tipo if ev else None,
            "duracion_minutos": ev.duracion_minutos if ev else None,
            "puntaje_obtenido": ep.puntaje_obtenido,
            "estado": ep.estado,
            "fecha_asignacion": ep.fecha_asignacion.isoformat() if ep.fecha_asignacion else None,
            "fecha_completado": ep.fecha_completado.isoformat() if ep.fecha_completado else None,
        })
    return result


# --- Mis Documentos ---

@router.get("/mis-documentos")
def get_mis_documentos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    documentos = (
        db.query(Documento)
        .filter(Documento.postulante_id == postulante.id)
        .order_by(Documento.tipo)
        .all()
    )
    return [
        {
            "id": d.id,
            "tipo": d.tipo,
            "nombre_archivo": d.nombre_archivo,
            "url": d.url,
            "estado": d.estado,
            "requerido": d.requerido,
            "observacion": d.observacion,
            "fecha_subida": d.fecha_subida.isoformat() if d.fecha_subida else None,
            "fecha_revision": d.fecha_revision.isoformat() if d.fecha_revision else None,
        }
        for d in documentos
    ]


# --- Mis Entrevistas ---

@router.get("/mis-entrevistas")
def get_mis_entrevistas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    entrevistas = (
        db.query(Entrevista)
        .filter(Entrevista.postulante_id == postulante.id)
        .order_by(Entrevista.fecha.desc())
        .all()
    )
    return [
        {
            "id": e.id,
            "tipo": e.tipo,
            "fecha": e.fecha.isoformat() if e.fecha else None,
            "hora": e.hora,
            "lugar": e.lugar,
            "evaluador_nombre": e.evaluador_nombre,
            "duracion": e.duracion,
            "estado": e.estado,
        }
        for e in entrevistas
    ]


# --- Firmas Digitales ---

@router.post("/firma", response_model=FirmaResponse, status_code=status.HTTP_201_CREATED)
def create_firma(
    data: FirmaCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    hash_doc = hashlib.sha256(data.firma_data.encode()).hexdigest()
    ip = data.ip_address or (request.client.host if request.client else None)

    firma = FirmaDigital(
        usuario_id=current_user.id,
        tipo_documento=data.tipo_documento,
        firma_data=data.firma_data,
        ip_address=ip,
        hash_documento=hash_doc,
    )
    db.add(firma)
    db.commit()
    db.refresh(firma)
    return firma


@router.get("/mis-firmas", response_model=list[FirmaResponse])
def get_mis_firmas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    firmas = (
        db.query(FirmaDigital)
        .filter(FirmaDigital.usuario_id == current_user.id)
        .order_by(FirmaDigital.fecha_firma.desc())
        .all()
    )
    return firmas


# --- Derechohabientes ---

@router.get("/derechohabientes", response_model=list[DerechohabienteResponse])
def list_derechohabientes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    return (
        db.query(Derechohabiente)
        .filter(Derechohabiente.trabajador_id == postulante.id)
        .all()
    )


@router.post("/derechohabientes", response_model=DerechohabienteResponse, status_code=status.HTTP_201_CREATED)
def create_derechohabiente(
    data: DerechohabienteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    derecho = Derechohabiente(
        trabajador_id=postulante.id,
        nombre_completo=data.nombre_completo,
        parentesco=data.parentesco,
        dni=data.dni,
        fecha_nacimiento=data.fecha_nacimiento,
        genero=data.genero,
        telefono=data.telefono,
    )
    db.add(derecho)
    db.commit()
    db.refresh(derecho)
    return derecho


@router.put("/derechohabientes/{derecho_id}", response_model=DerechohabienteResponse)
def update_derechohabiente(
    derecho_id: int,
    data: DerechohabienteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    derecho = (
        db.query(Derechohabiente)
        .filter(Derechohabiente.id == derecho_id, Derechohabiente.trabajador_id == postulante.id)
        .first()
    )
    if not derecho:
        raise HTTPException(status_code=404, detail="Derechohabiente no encontrado")
    derecho.nombre_completo = data.nombre_completo
    derecho.parentesco = data.parentesco
    derecho.dni = data.dni
    derecho.fecha_nacimiento = data.fecha_nacimiento
    derecho.genero = data.genero
    derecho.telefono = data.telefono
    db.commit()
    db.refresh(derecho)
    return derecho


@router.delete("/derechohabientes/{derecho_id}")
def delete_derechohabiente(
    derecho_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    derecho = (
        db.query(Derechohabiente)
        .filter(Derechohabiente.id == derecho_id, Derechohabiente.trabajador_id == postulante.id)
        .first()
    )
    if not derecho:
        raise HTTPException(status_code=404, detail="Derechohabiente no encontrado")
    db.delete(derecho)
    db.commit()
    return {"message": "Derechohabiente eliminado correctamente"}


# --- Datos Bancarios ---

@router.get("/datos-bancarios", response_model=DatoBancarioResponse)
def get_datos_bancarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    dato = (
        db.query(DatoBancario)
        .filter(DatoBancario.trabajador_id == postulante.id)
        .first()
    )
    if not dato:
        raise HTTPException(status_code=404, detail="Datos bancarios no registrados")
    return dato


@router.post("/datos-bancarios", response_model=DatoBancarioResponse, status_code=status.HTTP_201_CREATED)
def create_datos_bancarios(
    data: DatoBancarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    existing = (
        db.query(DatoBancario)
        .filter(DatoBancario.trabajador_id == postulante.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Ya existen datos bancarios. Use PUT para actualizar.")

    dato = DatoBancario(
        trabajador_id=postulante.id,
        tiene_cuenta=data.tiene_cuenta,
        entidad=data.entidad,
        tipo_cuenta=data.tipo_cuenta,
        numero_cuenta=data.numero_cuenta,
        cci=data.cci,
    )
    db.add(dato)
    db.commit()
    db.refresh(dato)
    return dato


@router.put("/datos-bancarios", response_model=DatoBancarioResponse)
def update_datos_bancarios(
    data: DatoBancarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    dato = (
        db.query(DatoBancario)
        .filter(DatoBancario.trabajador_id == postulante.id)
        .first()
    )
    if not dato:
        dato = DatoBancario(trabajador_id=postulante.id)
        db.add(dato)
    dato.tiene_cuenta = data.tiene_cuenta
    dato.entidad = data.entidad
    dato.tipo_cuenta = data.tipo_cuenta
    dato.numero_cuenta = data.numero_cuenta
    dato.cci = data.cci
    dato.fecha_actualizacion = datetime.now(timezone.utc)
    db.commit()
    db.refresh(dato)
    return dato


# --- Regimen Pensionario ---

@router.get("/regimen-pensionario", response_model=RegimenPensionarioResponse)
def get_regimen_pensionario(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    regimen = (
        db.query(RegimenPensionario)
        .filter(RegimenPensionario.trabajador_id == postulante.id)
        .first()
    )
    if not regimen:
        raise HTTPException(status_code=404, detail="Regimen pensionario no registrado")
    return regimen


@router.post("/regimen-pensionario", response_model=RegimenPensionarioResponse, status_code=status.HTTP_201_CREATED)
def create_regimen_pensionario(
    data: RegimenPensionarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    existing = (
        db.query(RegimenPensionario)
        .filter(RegimenPensionario.trabajador_id == postulante.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe regimen pensionario. Use PUT para actualizar.")

    regimen = RegimenPensionario(
        trabajador_id=postulante.id,
        tipo=data.tipo,
        entidad=data.entidad,
        cuspp=data.cuspp,
        primer_trabajo=data.primer_trabajo,
    )
    db.add(regimen)
    db.commit()
    db.refresh(regimen)
    return regimen


@router.put("/regimen-pensionario", response_model=RegimenPensionarioResponse)
def update_regimen_pensionario(
    data: RegimenPensionarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    regimen = (
        db.query(RegimenPensionario)
        .filter(RegimenPensionario.trabajador_id == postulante.id)
        .first()
    )
    if not regimen:
        regimen = RegimenPensionario(trabajador_id=postulante.id)
        db.add(regimen)
    regimen.tipo = data.tipo
    regimen.entidad = data.entidad
    regimen.cuspp = data.cuspp
    regimen.primer_trabajo = data.primer_trabajo
    regimen.fecha_actualizacion = datetime.now(timezone.utc)
    db.commit()
    db.refresh(regimen)
    return regimen


# --- Mis Capacitaciones ---

@router.get("/mis-capacitaciones")
def get_mis_capacitaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = _get_postulante_for_user(db, current_user)
    asignaciones = (
        db.query(CapacitacionTrabajador)
        .filter(CapacitacionTrabajador.trabajador_id == postulante.id)
        .all()
    )
    result = []
    for ct in asignaciones:
        cap = db.query(Capacitacion).filter(Capacitacion.id == ct.capacitacion_id).first()
        result.append({
            "id": ct.id,
            "capacitacion_id": ct.capacitacion_id,
            "nombre": cap.nombre if cap else None,
            "descripcion": cap.descripcion if cap else None,
            "fecha_limite": cap.fecha_limite.isoformat() if cap and cap.fecha_limite else None,
            "obligatoria": cap.obligatoria if cap else None,
            "cumplimiento": ct.cumplimiento,
            "fecha_completado": ct.fecha_completado.isoformat() if ct.fecha_completado else None,
            "certificado_url": ct.certificado_url,
        })
    return result
