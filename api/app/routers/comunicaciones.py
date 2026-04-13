import logging
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func, cast, Date
from typing import Optional

from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.postulante import Postulante, FichaPersonal
from ..models.anuncio import Anuncio
from ..models.comunicacion import ComunicacionLog
from ..models.festividad import Festividad
from ..models.email_plantilla import EmailPlantilla
from ..auth.dependencies import require_role
from ..schemas.comunicacion import (
    ComunicacionResponse,
    CumpleanosResponse,
    FestividadResponse,
    CheckHoyResponse,
    CumpleanosHoyItem,
    FestividadHoyItem,
    PlantillaResponse,
    PlantillaUpdate,
)
from ..services.email_service import (
    send_email,
    send_bulk_email,
    template_bienvenida,
    template_cesado,
    template_cumpleanos,
    template_festividad,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/bienvenida/{postulante_id}")
def enviar_bienvenida(
    postulante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Envia email de bienvenida para nuevo trabajador y crea anuncio."""
    postulante = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    usuario = db.query(Usuario).filter(Usuario.id == postulante.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    nombre = usuario.nombre
    puesto = postulante.puesto

    # Crear anuncio de bienvenida
    anuncio = Anuncio(
        titulo=f"Bienvenida - {nombre}",
        contenido=f"{nombre} se ha incorporado al equipo como {puesto}.",
        tipo="bienvenida",
        destinatarios="todos",
        activo=True,
        creado_por=current_user.id,
    )
    db.add(anuncio)

    # Enviar email a todos los usuarios activos
    usuarios_activos = db.query(Usuario).filter(Usuario.activo == True).all()
    recipients = [u.email for u in usuarios_activos if u.email]
    html = template_bienvenida(nombre, puesto)
    result = send_bulk_email(recipients, f"Bienvenida - {nombre} se une al equipo", html)

    # Registrar en log
    for email in recipients:
        log = ComunicacionLog(
            tipo="bienvenida",
            destinatario_email=email,
            asunto=f"Bienvenida - {nombre} se une al equipo",
            estado="enviado",
            postulante_id=postulante_id,
        )
        db.add(log)

    db.commit()
    return {"detail": "Bienvenida enviada", "enviados": result["sent"], "fallidos": result["failed"]}


@router.post("/cesado/{postulante_id}")
def enviar_cesado(
    postulante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Envia notificacion de cese y crea anuncio."""
    postulante = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    usuario = db.query(Usuario).filter(Usuario.id == postulante.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    nombre = usuario.nombre
    puesto = postulante.puesto

    # Crear anuncio de cese
    anuncio = Anuncio(
        titulo=f"Comunicado - {nombre}",
        contenido=f"{nombre}, quien desempenaba el puesto de {puesto}, ha dejado de formar parte del equipo.",
        tipo="cesado",
        destinatarios="todos",
        activo=True,
        creado_por=current_user.id,
    )
    db.add(anuncio)

    # Enviar email a todos los usuarios activos
    usuarios_activos = db.query(Usuario).filter(Usuario.activo == True).all()
    recipients = [u.email for u in usuarios_activos if u.email]
    html = template_cesado(nombre, puesto)
    result = send_bulk_email(recipients, f"Comunicado al personal - {nombre}", html)

    # Registrar en log
    for email in recipients:
        log = ComunicacionLog(
            tipo="cesado",
            destinatario_email=email,
            asunto=f"Comunicado al personal - {nombre}",
            estado="enviado",
            postulante_id=postulante_id,
        )
        db.add(log)

    db.commit()
    return {"detail": "Comunicado de cese enviado", "enviados": result["sent"], "fallidos": result["failed"]}


@router.post("/cumpleanos")
def enviar_cumpleanos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Envia emails de cumpleanos a los que cumplen hoy."""
    hoy = datetime.now()
    mes_dia = (hoy.month, hoy.day)

    # Buscar fichas con cumpleanos hoy
    fichas = db.query(FichaPersonal).all()
    cumpleaneros = []
    for ficha in fichas:
        if ficha.fecha_nacimiento and (ficha.fecha_nacimiento.month, ficha.fecha_nacimiento.day) == mes_dia:
            postulante = db.query(Postulante).filter(Postulante.id == ficha.postulante_id).first()
            if postulante:
                usuario = db.query(Usuario).filter(Usuario.id == postulante.usuario_id).first()
                if usuario and usuario.activo:
                    cumpleaneros.append({"usuario": usuario, "postulante": postulante})

    if not cumpleaneros:
        return {"detail": "No hay cumpleanos hoy", "enviados": 0}

    enviados = 0
    for c in cumpleaneros:
        usuario = c["usuario"]
        html = template_cumpleanos(usuario.nombre)
        success = send_email(usuario.email, f"Feliz Cumpleanos, {usuario.nombre}!", html)

        log = ComunicacionLog(
            tipo="cumpleanos",
            destinatario_email=usuario.email,
            asunto=f"Feliz Cumpleanos, {usuario.nombre}!",
            estado="enviado" if success else "fallido",
            postulante_id=c["postulante"].id,
        )
        db.add(log)

        if success:
            enviados += 1

    db.commit()
    return {"detail": f"Emails de cumpleanos enviados", "enviados": enviados, "total": len(cumpleaneros)}


@router.post("/festividad")
def enviar_festividad(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Envia saludo de festividad del dia a todos los usuarios activos."""
    hoy = datetime.now().strftime("%m-%d")

    festividad = db.query(Festividad).filter(
        Festividad.fecha == hoy,
        Festividad.activa == True,
    ).first()

    if not festividad:
        raise HTTPException(status_code=404, detail="No hay festividad activa para hoy")

    usuarios_activos = db.query(Usuario).filter(Usuario.activo == True).all()
    recipients = [u.email for u in usuarios_activos if u.email]

    if not recipients:
        raise HTTPException(status_code=400, detail="No hay usuarios activos")

    html = template_festividad(festividad.nombre, festividad.mensaje or "")
    result = send_bulk_email(recipients, f"Aquarius - {festividad.nombre}", html)

    # Registrar en log
    for email in recipients:
        log = ComunicacionLog(
            tipo="festividad",
            destinatario_email=email,
            asunto=f"Aquarius - {festividad.nombre}",
            estado="enviado",
            detalle=f"Festividad: {festividad.nombre}",
        )
        db.add(log)

    db.commit()
    return {"detail": "Festividad enviada", "enviados": result["sent"], "fallidos": result["failed"]}


@router.get("/cumpleanos-hoy", response_model=list[CumpleanosResponse])
def cumpleanos_hoy(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Obtiene lista de usuarios que cumplen anos hoy."""
    hoy = datetime.now()
    mes_dia = (hoy.month, hoy.day)

    fichas = db.query(FichaPersonal).all()
    resultado = []
    for ficha in fichas:
        if ficha.fecha_nacimiento and (ficha.fecha_nacimiento.month, ficha.fecha_nacimiento.day) == mes_dia:
            postulante = db.query(Postulante).filter(Postulante.id == ficha.postulante_id).first()
            if postulante:
                usuario = db.query(Usuario).filter(Usuario.id == postulante.usuario_id).first()
                if usuario and usuario.activo:
                    resultado.append(CumpleanosResponse(
                        postulante_id=postulante.id,
                        nombre=usuario.nombre,
                        email=usuario.email,
                        puesto=postulante.puesto,
                        fecha_nacimiento=ficha.fecha_nacimiento.strftime("%Y-%m-%d") if ficha.fecha_nacimiento else None,
                    ))

    return resultado


@router.get("/festividades", response_model=list[FestividadResponse])
def listar_festividades(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Lista todas las festividades."""
    return db.query(Festividad).order_by(Festividad.fecha).all()


@router.get("/historial", response_model=list[ComunicacionResponse])
def historial_comunicaciones(
    tipo: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Obtiene historial de comunicaciones con filtros."""
    query = db.query(ComunicacionLog)
    if tipo:
        query = query.filter(ComunicacionLog.tipo == tipo)
    if estado:
        query = query.filter(ComunicacionLog.estado == estado)
    return query.order_by(ComunicacionLog.id.desc()).offset(skip).limit(limit).all()


# ==================== FEATURE 1: Daily Check ====================

@router.get("/check-hoy", response_model=CheckHoyResponse)
def check_hoy(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "evaluador"])),
):
    """Verifica cumpleanos y festividades de hoy para el modal de login."""
    hoy = datetime.now()
    mes_dia = (hoy.month, hoy.day)
    hoy_str = hoy.strftime("%m-%d")
    hoy_date = hoy.date()

    # --- Cumpleanos de hoy ---
    fichas = db.query(FichaPersonal).all()
    cumpleaneros: list[CumpleanosHoyItem] = []
    for ficha in fichas:
        if ficha.fecha_nacimiento and (ficha.fecha_nacimiento.month, ficha.fecha_nacimiento.day) == mes_dia:
            postulante = db.query(Postulante).filter(Postulante.id == ficha.postulante_id).first()
            if postulante:
                usuario = db.query(Usuario).filter(Usuario.id == postulante.usuario_id).first()
                if usuario and usuario.activo:
                    cumpleaneros.append(CumpleanosHoyItem(
                        id=usuario.id,
                        nombre=usuario.nombre,
                        email=usuario.email,
                    ))

    # --- Festividad de hoy ---
    festividad_db = db.query(Festividad).filter(
        Festividad.fecha == hoy_str,
        Festividad.activa == True,
    ).first()
    festividad_item = None
    if festividad_db:
        festividad_item = FestividadHoyItem(
            nombre=festividad_db.nombre,
            mensaje=festividad_db.mensaje or "",
        )

    # --- Ya enviado hoy? Check comunicaciones_log for today ---
    ya_enviado_cumpleanos = db.query(ComunicacionLog).filter(
        ComunicacionLog.tipo == "cumpleanos",
        cast(ComunicacionLog.fecha_envio, Date) == hoy_date,
    ).first() is not None

    ya_enviado_festividad = db.query(ComunicacionLog).filter(
        ComunicacionLog.tipo == "festividad",
        cast(ComunicacionLog.fecha_envio, Date) == hoy_date,
    ).first() is not None

    return CheckHoyResponse(
        cumpleanos=cumpleaneros,
        festividad=festividad_item,
        ya_enviado_cumpleanos=ya_enviado_cumpleanos,
        ya_enviado_festividad=ya_enviado_festividad,
    )


# ==================== FEATURE 2: Email Plantillas ====================

DEFAULT_PLANTILLAS = [
    {
        "tipo": "credenciales",
        "asunto": "Tus credenciales de acceso - OnboardIQ Aquarius",
        "variables_disponibles": "{nombre},{email},{password},{puesto}",
    },
    {
        "tipo": "bienvenida",
        "asunto": "Bienvenida - {nombre} se une al equipo",
        "variables_disponibles": "{nombre},{puesto}",
    },
    {
        "tipo": "cesado",
        "asunto": "Comunicado al personal - {nombre}",
        "variables_disponibles": "{nombre},{puesto}",
    },
    {
        "tipo": "cumpleanos",
        "asunto": "Feliz Cumpleanos, {nombre}!",
        "variables_disponibles": "{nombre}",
    },
    {
        "tipo": "festividad",
        "asunto": "Aquarius - {nombre_festividad}",
        "variables_disponibles": "{nombre_festividad},{mensaje}",
    },
    {
        "tipo": "anuncio",
        "asunto": "{titulo}",
        "variables_disponibles": "{titulo},{contenido}",
    },
]


def _seed_default_plantillas(db: Session) -> None:
    """Seed default templates if table is empty."""
    from ..services.email_service import (
        template_credenciales,
        template_bienvenida,
        template_cesado,
        template_cumpleanos,
        template_festividad,
    )

    existing = db.query(EmailPlantilla).count()
    if existing > 0:
        return

    default_contents = {
        "credenciales": template_credenciales("{nombre}", "{email}", "{password}", "{puesto}"),
        "bienvenida": template_bienvenida("{nombre}", "{puesto}"),
        "cesado": template_cesado("{nombre}", "{puesto}"),
        "cumpleanos": template_cumpleanos("{nombre}"),
        "festividad": template_festividad("{nombre_festividad}", "{mensaje}"),
        "anuncio": """<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#0a1f3d,#1a7ec5);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">{titulo}</h1>
        </div>
        <div style="padding:30px">
            <p style="color:#64748b;font-size:14px">{contenido}</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
        </div>
    </div>""",
    }

    for tmpl in DEFAULT_PLANTILLAS:
        plantilla = EmailPlantilla(
            tipo=tmpl["tipo"],
            asunto=tmpl["asunto"],
            contenido=default_contents.get(tmpl["tipo"], ""),
            variables_disponibles=tmpl["variables_disponibles"],
            activa=True,
        )
        db.add(plantilla)

    db.commit()
    logger.info("Default email plantillas seeded")


@router.get("/plantillas", response_model=list[PlantillaResponse])
def listar_plantillas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Lista todas las plantillas de email. Si no existen, crea las por defecto."""
    _seed_default_plantillas(db)
    return db.query(EmailPlantilla).order_by(EmailPlantilla.tipo).all()


@router.put("/plantillas/{tipo}", response_model=PlantillaResponse)
def actualizar_plantilla(
    tipo: str,
    datos: PlantillaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Actualiza una plantilla de email por tipo."""
    plantilla = db.query(EmailPlantilla).filter(EmailPlantilla.tipo == tipo).first()
    if not plantilla:
        raise HTTPException(status_code=404, detail=f"Plantilla '{tipo}' no encontrada")

    if datos.asunto is not None:
        plantilla.asunto = datos.asunto
    if datos.contenido is not None:
        plantilla.contenido = datos.contenido
    if datos.activa is not None:
        plantilla.activa = datos.activa

    plantilla.fecha_actualizacion = datetime.now()
    db.commit()
    db.refresh(plantilla)
    return plantilla
