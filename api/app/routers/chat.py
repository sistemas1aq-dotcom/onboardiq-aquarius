import base64
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional

from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.chat import ChatConversacion, ChatParticipante, ChatMensaje
from ..auth.dependencies import get_current_user
from ..schemas.chat import (
    ConversacionCreate,
    ConversacionResponse,
    MensajeCreate,
    MensajeResponse,
    NoLeidosResponse,
)

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.get("/conversaciones", response_model=list[ConversacionResponse])
def listar_conversaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista conversaciones del usuario actual con ultimo mensaje y no leidos."""
    # Get conversation IDs where the user is a participant
    participaciones = (
        db.query(ChatParticipante.conversacion_id)
        .filter(ChatParticipante.usuario_id == current_user.id)
        .all()
    )
    conv_ids = [p.conversacion_id for p in participaciones]

    if not conv_ids:
        return []

    conversaciones = (
        db.query(ChatConversacion)
        .filter(ChatConversacion.id.in_(conv_ids))
        .order_by(ChatConversacion.id.desc())
        .all()
    )

    result = []
    for conv in conversaciones:
        # Last message
        ultimo_msg = (
            db.query(ChatMensaje)
            .filter(ChatMensaje.conversacion_id == conv.id)
            .order_by(ChatMensaje.id.desc())
            .first()
        )

        # Unread count
        no_leidos = (
            db.query(func.count(ChatMensaje.id))
            .filter(
                ChatMensaje.conversacion_id == conv.id,
                ChatMensaje.usuario_id != current_user.id,
                ChatMensaje.leido == False,
            )
            .scalar()
        )

        # Participants
        participantes = (
            db.query(ChatParticipante, Usuario)
            .join(Usuario, ChatParticipante.usuario_id == Usuario.id)
            .filter(ChatParticipante.conversacion_id == conv.id)
            .all()
        )

        nombre_display = conv.nombre
        if not nombre_display and conv.tipo == "directo":
            # For direct chats, show the other user's name
            for cp, u in participantes:
                if u.id != current_user.id:
                    nombre_display = u.nombre
                    break

        result.append(ConversacionResponse(
            id=conv.id,
            nombre=nombre_display,
            tipo=conv.tipo,
            creado_por=conv.creado_por,
            fecha_creacion=conv.fecha_creacion,
            ultimo_mensaje=ultimo_msg.contenido if ultimo_msg else None,
            no_leidos=no_leidos or 0,
            participantes=[
                {"id": u.id, "nombre": u.nombre}
                for cp, u in participantes
            ],
        ))

    return result


@router.post("/conversaciones", response_model=ConversacionResponse)
def crear_conversacion(
    data: ConversacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crea una conversacion. Para 'directo', verifica si ya existe entre los 2 usuarios."""
    tipo = data.tipo or "directo"

    # For direct chats, check if conversation already exists between the 2 users
    if tipo == "directo" and len(data.participante_ids) == 1:
        other_user_id = data.participante_ids[0]

        # Find conversations where both users are participants
        my_convs = (
            db.query(ChatParticipante.conversacion_id)
            .filter(ChatParticipante.usuario_id == current_user.id)
            .subquery()
        )
        other_convs = (
            db.query(ChatParticipante.conversacion_id)
            .filter(ChatParticipante.usuario_id == other_user_id)
            .subquery()
        )

        existing = (
            db.query(ChatConversacion)
            .filter(
                ChatConversacion.id.in_(
                    db.query(my_convs.c.conversacion_id).filter(
                        my_convs.c.conversacion_id.in_(
                            db.query(other_convs.c.conversacion_id)
                        )
                    )
                ),
                ChatConversacion.tipo == "directo",
            )
            .first()
        )

        if existing:
            # Return existing conversation
            participantes = (
                db.query(ChatParticipante, Usuario)
                .join(Usuario, ChatParticipante.usuario_id == Usuario.id)
                .filter(ChatParticipante.conversacion_id == existing.id)
                .all()
            )
            return ConversacionResponse(
                id=existing.id,
                nombre=existing.nombre,
                tipo=existing.tipo,
                creado_por=existing.creado_por,
                fecha_creacion=existing.fecha_creacion,
                participantes=[
                    {"id": u.id, "nombre": u.nombre}
                    for cp, u in participantes
                ],
            )

    # Create new conversation
    conversacion = ChatConversacion(
        nombre=data.nombre,
        tipo=tipo,
        creado_por=current_user.id,
    )
    db.add(conversacion)
    db.flush()

    # Add current user as participant
    db.add(ChatParticipante(
        conversacion_id=conversacion.id,
        usuario_id=current_user.id,
    ))

    # Add other participants
    for uid in data.participante_ids:
        if uid != current_user.id:
            db.add(ChatParticipante(
                conversacion_id=conversacion.id,
                usuario_id=uid,
            ))

    db.commit()
    db.refresh(conversacion)

    participantes = (
        db.query(ChatParticipante, Usuario)
        .join(Usuario, ChatParticipante.usuario_id == Usuario.id)
        .filter(ChatParticipante.conversacion_id == conversacion.id)
        .all()
    )

    return ConversacionResponse(
        id=conversacion.id,
        nombre=conversacion.nombre,
        tipo=conversacion.tipo,
        creado_por=conversacion.creado_por,
        fecha_creacion=conversacion.fecha_creacion,
        participantes=[
            {"id": u.id, "nombre": u.nombre}
            for cp, u in participantes
        ],
    )


@router.get("/conversaciones/{conversacion_id}/mensajes", response_model=list[MensajeResponse])
def listar_mensajes(
    conversacion_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista mensajes de una conversacion paginados."""
    # Verify user is participant
    participante = (
        db.query(ChatParticipante)
        .filter(
            ChatParticipante.conversacion_id == conversacion_id,
            ChatParticipante.usuario_id == current_user.id,
        )
        .first()
    )
    if not participante:
        raise HTTPException(status_code=403, detail="No es participante de esta conversacion")

    mensajes = (
        db.query(ChatMensaje)
        .filter(ChatMensaje.conversacion_id == conversacion_id)
        .order_by(ChatMensaje.fecha_envio.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for msg in mensajes:
        usuario = db.query(Usuario).filter(Usuario.id == msg.usuario_id).first()
        result.append(MensajeResponse(
            id=msg.id,
            conversacion_id=msg.conversacion_id,
            usuario_id=msg.usuario_id,
            contenido=msg.contenido,
            tipo_mensaje=msg.tipo_mensaje or "texto",
            archivo_url=msg.archivo_url,
            archivo_nombre=msg.archivo_nombre,
            archivo_tamano=msg.archivo_tamano,
            fecha_envio=msg.fecha_envio,
            leido=msg.leido or False,
            usuario_nombre=usuario.nombre if usuario else None,
        ))

    return result


@router.post("/conversaciones/{conversacion_id}/mensajes", response_model=MensajeResponse)
def enviar_mensaje(
    conversacion_id: int,
    data: MensajeCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Envia un mensaje de texto en una conversacion."""
    # Verify user is participant
    participante = (
        db.query(ChatParticipante)
        .filter(
            ChatParticipante.conversacion_id == conversacion_id,
            ChatParticipante.usuario_id == current_user.id,
        )
        .first()
    )
    if not participante:
        raise HTTPException(status_code=403, detail="No es participante de esta conversacion")

    mensaje = ChatMensaje(
        conversacion_id=conversacion_id,
        usuario_id=current_user.id,
        contenido=data.contenido,
        tipo_mensaje="texto",
    )
    db.add(mensaje)
    db.commit()
    db.refresh(mensaje)

    return MensajeResponse(
        id=mensaje.id,
        conversacion_id=mensaje.conversacion_id,
        usuario_id=mensaje.usuario_id,
        contenido=mensaje.contenido,
        tipo_mensaje=mensaje.tipo_mensaje or "texto",
        fecha_envio=mensaje.fecha_envio,
        leido=mensaje.leido or False,
        usuario_nombre=current_user.nombre,
    )


@router.post("/conversaciones/{conversacion_id}/archivo", response_model=MensajeResponse)
async def enviar_archivo(
    conversacion_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Sube un archivo a la conversacion. Almacena como base64 para archivos < 5MB."""
    # Verify user is participant
    participante = (
        db.query(ChatParticipante)
        .filter(
            ChatParticipante.conversacion_id == conversacion_id,
            ChatParticipante.usuario_id == current_user.id,
        )
        .first()
    )
    if not participante:
        raise HTTPException(status_code=403, detail="No es participante de esta conversacion")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="El archivo excede el limite de 5MB")

    # Determine tipo_mensaje based on content type
    content_type = file.content_type or ""
    if content_type.startswith("image/"):
        tipo_mensaje = "imagen"
    elif content_type == "application/pdf":
        tipo_mensaje = "documento"
    else:
        tipo_mensaje = "archivo"

    # Store as base64
    archivo_b64 = base64.b64encode(contents).decode("utf-8")
    archivo_url = f"data:{content_type};base64,{archivo_b64}"

    mensaje = ChatMensaje(
        conversacion_id=conversacion_id,
        usuario_id=current_user.id,
        contenido=file.filename,
        tipo_mensaje=tipo_mensaje,
        archivo_url=archivo_url,
        archivo_nombre=file.filename,
        archivo_tamano=len(contents),
    )
    db.add(mensaje)
    db.commit()
    db.refresh(mensaje)

    return MensajeResponse(
        id=mensaje.id,
        conversacion_id=mensaje.conversacion_id,
        usuario_id=mensaje.usuario_id,
        contenido=mensaje.contenido,
        tipo_mensaje=mensaje.tipo_mensaje or "archivo",
        archivo_url=mensaje.archivo_url,
        archivo_nombre=mensaje.archivo_nombre,
        archivo_tamano=mensaje.archivo_tamano,
        fecha_envio=mensaje.fecha_envio,
        leido=mensaje.leido or False,
        usuario_nombre=current_user.nombre,
    )


@router.get("/usuarios")
def listar_usuarios_chat(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista todos los usuarios activos para iniciar nuevos chats."""
    usuarios = (
        db.query(Usuario)
        .filter(Usuario.activo == True, Usuario.id != current_user.id)
        .order_by(Usuario.nombre)
        .all()
    )
    return [
        {"id": u.id, "nombre": u.nombre, "email": u.email, "rol": u.rol}
        for u in usuarios
    ]


@router.put("/mensajes/{mensaje_id}/leido")
def marcar_leido(
    mensaje_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Marca un mensaje como leido."""
    mensaje = db.query(ChatMensaje).filter(ChatMensaje.id == mensaje_id).first()
    if not mensaje:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    mensaje.leido = True
    db.commit()
    return {"detail": "Mensaje marcado como leido"}


@router.get("/no-leidos", response_model=NoLeidosResponse)
def contar_no_leidos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Cuenta mensajes no leidos del usuario actual."""
    # Get conversations where user is participant
    conv_ids = (
        db.query(ChatParticipante.conversacion_id)
        .filter(ChatParticipante.usuario_id == current_user.id)
        .subquery()
    )

    total = (
        db.query(func.count(ChatMensaje.id))
        .filter(
            ChatMensaje.conversacion_id.in_(db.query(conv_ids.c.conversacion_id)),
            ChatMensaje.usuario_id != current_user.id,
            ChatMensaje.leido == False,
        )
        .scalar()
    )

    return NoLeidosResponse(total=total or 0)
