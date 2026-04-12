import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.postulante import Postulante
from ..models.aprobador import AprobadorPostulante
from ..auth.dependencies import get_current_user, require_role
from ..schemas.aprobador import (
    AprobadorAsignar,
    AprobadorReordenar,
    AprobadorAccion,
    AprobadorResponse,
    PendienteResponse,
)
from ..services.email_service import send_email

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/mis-pendientes", response_model=list[PendienteResponse])
def mis_pendientes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene aprobaciones pendientes para el usuario actual."""
    # Get all pending approvals assigned to current user
    mis_aprobaciones = (
        db.query(AprobadorPostulante)
        .filter(
            AprobadorPostulante.usuario_id == current_user.id,
            AprobadorPostulante.estado == "pendiente",
        )
        .all()
    )

    result = []
    for ap in mis_aprobaciones:
        # Check that all previous approvers (lower orden) have approved
        anteriores = (
            db.query(AprobadorPostulante)
            .filter(
                AprobadorPostulante.postulante_id == ap.postulante_id,
                AprobadorPostulante.orden < ap.orden,
            )
            .all()
        )
        todos_aprobados = all(a.estado == "aprobado" for a in anteriores)
        if not todos_aprobados:
            continue

        # Get postulante info
        postulante = db.query(Postulante).filter(Postulante.id == ap.postulante_id).first()
        nombre = ""
        if postulante and postulante.usuario:
            nombre = postulante.usuario.nombre

        result.append(
            PendienteResponse(
                id=ap.id,
                postulante_id=ap.postulante_id,
                usuario_id=ap.usuario_id,
                orden=ap.orden,
                estado=ap.estado,
                comentario=ap.comentario,
                fecha_accion=ap.fecha_accion,
                postulante_nombre=nombre,
                postulante_puesto=postulante.puesto if postulante else None,
                postulante_estado=postulante.estado if postulante else None,
            )
        )

    return result


@router.get("/{postulante_id}", response_model=list[AprobadorResponse])
def listar_aprobadores(
    postulante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista todos los aprobadores de un postulante, ordenados por orden asc."""
    aprobadores = (
        db.query(AprobadorPostulante)
        .filter(AprobadorPostulante.postulante_id == postulante_id)
        .order_by(AprobadorPostulante.orden.asc())
        .all()
    )

    result = []
    for ap in aprobadores:
        usuario = db.query(Usuario).filter(Usuario.id == ap.usuario_id).first()
        result.append(
            AprobadorResponse(
                id=ap.id,
                postulante_id=ap.postulante_id,
                usuario_id=ap.usuario_id,
                orden=ap.orden,
                estado=ap.estado,
                comentario=ap.comentario,
                fecha_accion=ap.fecha_accion,
                usuario_nombre=usuario.nombre if usuario else None,
                usuario_area=usuario.area if usuario else None,
            )
        )

    return result


@router.post("/{postulante_id}", response_model=list[AprobadorResponse])
def asignar_aprobadores(
    postulante_id: int,
    data: AprobadorAsignar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Asigna aprobadores a un postulante. Reemplaza los existentes."""
    postulante = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    # Delete existing approvers
    db.query(AprobadorPostulante).filter(
        AprobadorPostulante.postulante_id == postulante_id
    ).delete()

    # Insert new ones
    nuevos = []
    for item in data.aprobadores:
        ap = AprobadorPostulante(
            postulante_id=postulante_id,
            usuario_id=item.usuario_id,
            orden=item.orden,
            estado="pendiente",
        )
        db.add(ap)
        nuevos.append(ap)

    db.commit()

    # Refresh and return
    result = []
    for ap in nuevos:
        db.refresh(ap)
        usuario = db.query(Usuario).filter(Usuario.id == ap.usuario_id).first()
        result.append(
            AprobadorResponse(
                id=ap.id,
                postulante_id=ap.postulante_id,
                usuario_id=ap.usuario_id,
                orden=ap.orden,
                estado=ap.estado,
                comentario=ap.comentario,
                fecha_accion=ap.fecha_accion,
                usuario_nombre=usuario.nombre if usuario else None,
                usuario_area=usuario.area if usuario else None,
            )
        )

    return result


@router.put("/{postulante_id}/reordenar", response_model=list[AprobadorResponse])
def reordenar_aprobadores(
    postulante_id: int,
    data: AprobadorReordenar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Reordena los aprobadores de un postulante."""
    for item in data.aprobadores:
        ap = db.query(AprobadorPostulante).filter(
            AprobadorPostulante.id == item.id,
            AprobadorPostulante.postulante_id == postulante_id,
        ).first()
        if ap:
            ap.orden = item.orden

    db.commit()

    # Return updated list
    return listar_aprobadores(postulante_id, db, current_user)


@router.post("/{aprobador_id}/aprobar")
def aprobar(
    aprobador_id: int,
    data: AprobadorAccion = AprobadorAccion(),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Aprueba una solicitud."""
    ap = db.query(AprobadorPostulante).filter(AprobadorPostulante.id == aprobador_id).first()
    if not ap:
        raise HTTPException(status_code=404, detail="Aprobador no encontrado")
    if ap.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No eres el aprobador asignado")
    if ap.estado != "pendiente":
        raise HTTPException(status_code=400, detail="Esta aprobacion ya fue procesada")

    ap.estado = "aprobado"
    ap.comentario = data.comentario
    ap.fecha_accion = datetime.utcnow()
    db.flush()

    # Check if this is the last approver
    siguiente = (
        db.query(AprobadorPostulante)
        .filter(
            AprobadorPostulante.postulante_id == ap.postulante_id,
            AprobadorPostulante.orden > ap.orden,
            AprobadorPostulante.estado == "pendiente",
        )
        .order_by(AprobadorPostulante.orden.asc())
        .first()
    )

    if siguiente is None:
        # All approved - update postulante
        postulante = db.query(Postulante).filter(Postulante.id == ap.postulante_id).first()
        if postulante:
            postulante.estado = "Aprobado"
    else:
        # Notify next approver
        next_user = db.query(Usuario).filter(Usuario.id == siguiente.usuario_id).first()
        postulante = db.query(Postulante).filter(Postulante.id == ap.postulante_id).first()
        if next_user and next_user.email and postulante:
            nombre_postulante = postulante.usuario.nombre if postulante.usuario else "Postulante"
            html = f"""
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
                <div style="background:linear-gradient(135deg,#0a1f3d,#1a7ec5);padding:30px;text-align:center">
                    <h1 style="color:#fff;margin:0;font-size:22px">Aprobacion Pendiente</h1>
                </div>
                <div style="padding:30px">
                    <p style="color:#0a1f3d;font-size:16px">Tiene una aprobacion pendiente para <strong>{nombre_postulante}</strong> - <strong>{postulante.puesto}</strong>.</p>
                    <p style="color:#64748b;font-size:14px">Ingrese al sistema para revisar y tomar accion.</p>
                    <a href="https://aquariusrecursos.vercel.app/admin/mis-aprobaciones" style="display:inline-block;background:#1a7ec5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-top:15px">Ir a Mis Aprobaciones</a>
                </div>
                <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
                    <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
                </div>
            </div>"""
            try:
                send_email(
                    next_user.email,
                    f"Aprobacion pendiente: {nombre_postulante} - {postulante.puesto}",
                    html,
                )
            except Exception as e:
                logger.error(f"Error enviando notificacion al siguiente aprobador: {e}")

    db.commit()
    return {"detail": "Aprobado exitosamente"}


@router.post("/{aprobador_id}/rechazar")
def rechazar(
    aprobador_id: int,
    data: AprobadorAccion = AprobadorAccion(),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Rechaza una solicitud."""
    ap = db.query(AprobadorPostulante).filter(AprobadorPostulante.id == aprobador_id).first()
    if not ap:
        raise HTTPException(status_code=404, detail="Aprobador no encontrado")
    if ap.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No eres el aprobador asignado")
    if ap.estado != "pendiente":
        raise HTTPException(status_code=400, detail="Esta aprobacion ya fue procesada")

    ap.estado = "rechazado"
    ap.comentario = data.comentario
    ap.fecha_accion = datetime.utcnow()

    # Mark all subsequent approvers as omitido
    db.query(AprobadorPostulante).filter(
        AprobadorPostulante.postulante_id == ap.postulante_id,
        AprobadorPostulante.orden > ap.orden,
    ).update({"estado": "omitido"})

    # Update postulante status
    postulante = db.query(Postulante).filter(Postulante.id == ap.postulante_id).first()
    if postulante:
        postulante.estado = "Rechazado"

    db.commit()
    return {"detail": "Rechazado exitosamente"}


@router.delete("/{postulante_id}/{aprobador_id}")
def eliminar_aprobador(
    postulante_id: int,
    aprobador_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Elimina un aprobador de la cadena."""
    ap = db.query(AprobadorPostulante).filter(
        AprobadorPostulante.id == aprobador_id,
        AprobadorPostulante.postulante_id == postulante_id,
    ).first()
    if not ap:
        raise HTTPException(status_code=404, detail="Aprobador no encontrado")

    db.delete(ap)
    db.commit()
    return {"message": "Aprobador eliminado"}


@router.post("/evaluacion/{evaluacion_id}")
def asignar_aprobadores_evaluacion(
    evaluacion_id: int,
    data: AprobadorAsignar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Asigna aprobadores a una evaluación y los notifica por correo."""
    from ..models.evaluacion import Evaluacion, EvaluacionPostulante

    evaluacion = db.query(Evaluacion).filter(Evaluacion.id == evaluacion_id).first()
    if not evaluacion:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")

    # Obtener postulantes asignados a esta evaluación
    asignaciones = db.query(EvaluacionPostulante).filter(
        EvaluacionPostulante.evaluacion_id == evaluacion_id
    ).all()

    postulante_ids = [a.postulante_id for a in asignaciones]

    # Para cada postulante, asignar los aprobadores
    for pid in postulante_ids:
        # Eliminar aprobadores existentes
        db.query(AprobadorPostulante).filter(
            AprobadorPostulante.postulante_id == pid
        ).delete()

        # Insertar nuevos
        for ap in data.aprobadores:
            nuevo = AprobadorPostulante(
                postulante_id=pid,
                usuario_id=ap.usuario_id,
                orden=ap.orden,
                estado="pendiente",
            )
            db.add(nuevo)

    # Si no hay postulantes asignados, solo enviamos emails (no guardamos en BD)
    db.commit()

    # Enviar correo a cada aprobador
    enviados = 0
    for ap in data.aprobadores:
        usuario = db.query(Usuario).filter(Usuario.id == ap.usuario_id).first()
        if usuario and usuario.email:
            html = f"""
            <div style="font-family:'Segoe UI',Arial;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
                <div style="background:linear-gradient(135deg,#0a1f3d,#1a7ec5);padding:30px;text-align:center">
                    <h1 style="color:#fff;margin:0;font-size:22px">OnboardIQ Aquarius</h1>
                    <p style="color:#3ec6e0;margin:5px 0 0;font-size:13px">Recruit System</p>
                </div>
                <div style="padding:30px">
                    <h2 style="color:#0a1f3d;font-size:18px">Ha sido asignado como Aprobador</h2>
                    <p style="color:#64748b;font-size:14px">Estimado/a <strong>{usuario.nombre}</strong>,</p>
                    <p style="color:#64748b;font-size:14px">Le informamos que ha sido asignado como <strong>aprobador nivel {ap.orden}</strong> para la evaluación:</p>
                    <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #3ec6e0">
                        <p style="margin:0;font-size:16px;color:#0a1f3d;font-weight:600">{evaluacion.nombre}</p>
                        <p style="margin:4px 0 0;font-size:13px;color:#64748b">Tipo: {evaluacion.tipo}</p>
                    </div>
                    <p style="color:#64748b;font-size:14px">Ingrese al sistema para revisar las postulaciones pendientes de aprobación.</p>
                    <a href="https://aquariusrecursos.vercel.app" style="display:inline-block;background:#1a7ec5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Ir al Sistema</a>
                </div>
                <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
                    <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
                </div>
            </div>"""
            if send_email(usuario.email, f"Asignado como Aprobador - {evaluacion.nombre}", html):
                enviados += 1

    return {
        "message": "Aprobadores asignados y notificados",
        "postulantes_afectados": len(postulante_ids),
        "aprobadores": len(data.aprobadores),
        "emails_enviados": enviados,
    }
    return {"detail": "Aprobador eliminado"}
