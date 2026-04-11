import io
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from openpyxl import Workbook, load_workbook

from ..models.database import get_db
from ..models.usuario import Usuario
from ..models.postulante import Postulante
from ..auth.dependencies import require_role
from ..auth.password import hash_password
from ..config import get_settings
from ..services.email_service import send_email, template_credenciales

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()


@router.post("/upload")
def upload_masivo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Carga masiva de postulantes desde archivo Excel (.xlsx)."""
    if not file.filename or not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .xlsx")

    try:
        contents = file.file.read()
        wb = load_workbook(filename=io.BytesIO(contents))
        ws = wb.active
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al leer el archivo: {str(e)}")

    # Validar cabeceras
    headers = [cell.value for cell in ws[1]] if ws.max_row and ws.max_row >= 1 else []
    expected = ["nombre", "apellido_paterno", "apellido_materno", "dni", "email", "puesto", "telefono"]
    headers_lower = [str(h).strip().lower() if h else "" for h in headers]
    for col in expected:
        if col not in headers_lower:
            raise HTTPException(
                status_code=400,
                detail=f"Columna requerida '{col}' no encontrada. Cabeceras encontradas: {headers}",
            )

    col_map = {col: headers_lower.index(col) for col in expected}

    creados = 0
    fallidos = 0
    errores = []

    for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        try:
            nombre_val = str(row[col_map["nombre"]] or "").strip()
            ap_paterno = str(row[col_map["apellido_paterno"]] or "").strip()
            ap_materno = str(row[col_map["apellido_materno"]] or "").strip()
            dni_val = str(row[col_map["dni"]] or "").strip()
            email_val = str(row[col_map["email"]] or "").strip()
            puesto_val = str(row[col_map["puesto"]] or "").strip()
            telefono_val = str(row[col_map["telefono"]] or "").strip()

            if not nombre_val or not dni_val or not email_val or not puesto_val:
                errores.append(f"Fila {row_num}: campos obligatorios vacios")
                fallidos += 1
                continue

            nombre_completo = f"{nombre_val} {ap_paterno} {ap_materno}".strip()

            # Validar duplicados
            existing_dni = db.query(Usuario).filter(Usuario.dni == dni_val).first()
            if existing_dni:
                errores.append(f"Fila {row_num}: DNI {dni_val} ya existe")
                fallidos += 1
                continue

            existing_email = db.query(Usuario).filter(Usuario.email == email_val).first()
            if existing_email:
                errores.append(f"Fila {row_num}: Email {email_val} ya existe")
                fallidos += 1
                continue

            # Crear usuario
            default_password = settings.DEFAULT_PASSWORD
            usuario = Usuario(
                email=email_val,
                password_hash=hash_password(default_password),
                nombre=nombre_completo,
                dni=dni_val,
                rol="postulante",
                telefono=telefono_val if telefono_val else None,
                activo=True,
            )
            db.add(usuario)
            db.flush()

            # Crear postulante
            postulante = Postulante(
                usuario_id=usuario.id,
                puesto=puesto_val,
                estado="En Evaluacion",
            )
            db.add(postulante)
            db.flush()

            # Enviar email de credenciales
            html = template_credenciales(nombre_completo, email_val, default_password, puesto_val)
            send_email(email_val, "Bienvenido a Aquarius - Tus credenciales de acceso", html)

            creados += 1

        except Exception as e:
            logger.error(f"Error en fila {row_num}: {e}")
            errores.append(f"Fila {row_num}: {str(e)}")
            fallidos += 1
            db.rollback()
            continue

    db.commit()
    return {"creados": creados, "fallidos": fallidos, "errores": errores}


@router.get("/plantilla")
def descargar_plantilla(
    current_user: Usuario = Depends(require_role(["admin"])),
):
    """Descarga plantilla Excel para carga masiva."""
    wb = Workbook()
    ws = wb.active
    ws.title = "Postulantes"

    headers = ["nombre", "apellido_paterno", "apellido_materno", "dni", "email", "puesto", "telefono"]
    ws.append(headers)

    # Fila de ejemplo
    ws.append(["Juan", "Perez", "Garcia", "12345678", "juan.perez@email.com", "Analista", "999888777"])

    # Ajustar ancho de columnas
    for col_num, header in enumerate(headers, 1):
        ws.column_dimensions[chr(64 + col_num)].width = 20

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=plantilla_carga_masiva.xlsx"},
    )
