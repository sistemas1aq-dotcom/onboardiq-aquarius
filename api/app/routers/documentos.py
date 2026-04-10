from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.documento import Documento
from ..models.postulante import Postulante
from ..schemas.documento import DocumentoResponse, DocumentoUpdate
from ..auth.dependencies import get_current_user
from ..services.auditoria import log_action

router = APIRouter(tags=["Documentos"])


@router.get("/{postulante_id}", response_model=list[DocumentoResponse])
def list_documentos(
    postulante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documentos = (
        db.query(Documento)
        .filter(Documento.postulante_id == postulante_id)
        .order_by(Documento.tipo)
        .all()
    )
    return documentos


@router.post("/upload", response_model=DocumentoResponse, status_code=status.HTTP_201_CREATED)
def upload_documento(
    postulante_id: int = Form(...),
    tipo: str = Form(...),
    requerido: bool = Form(True),
    archivo: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    postulante = db.query(Postulante).filter(Postulante.id == postulante_id).first()
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")

    # In production, save file to cloud storage and get URL
    # For now, store file metadata
    url = f"/uploads/documentos/{postulante_id}/{archivo.filename}"

    documento = Documento(
        postulante_id=postulante_id,
        tipo=tipo,
        nombre_archivo=archivo.filename,
        url=url,
        estado="pending",
        requerido=requerido,
        fecha_subida=datetime.now(timezone.utc),
    )
    db.add(documento)
    db.commit()
    db.refresh(documento)

    log_action(
        db,
        current_user.id,
        "subir_documento",
        f"Documento '{tipo}' subido para postulante ID {postulante_id}",
        request.client.host if request and request.client else None,
    )
    return documento


@router.put("/{documento_id}", response_model=DocumentoResponse)
def update_documento(
    documento_id: int,
    data: DocumentoUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documento = db.query(Documento).filter(Documento.id == documento_id).first()
    if not documento:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(documento, key, value)

    if "estado" in update_data:
        documento.fecha_revision = datetime.now(timezone.utc)

    db.commit()
    db.refresh(documento)

    log_action(
        db,
        current_user.id,
        "actualizar_documento",
        f"Documento ID {documento_id} actualizado: {list(update_data.keys())}",
        request.client.host if request.client else None,
    )
    return documento
