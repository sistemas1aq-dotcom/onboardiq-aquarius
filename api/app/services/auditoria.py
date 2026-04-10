from sqlalchemy.orm import Session
from ..models.auditoria import Auditoria


def log_action(
    db: Session,
    usuario_id: int | None,
    accion: str,
    detalle: str | None = None,
    ip: str | None = None,
) -> Auditoria:
    registro = Auditoria(
        usuario_id=usuario_id,
        accion=accion,
        detalle=detalle,
        ip_address=ip,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return registro
