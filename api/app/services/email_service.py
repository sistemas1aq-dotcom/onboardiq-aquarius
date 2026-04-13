import logging
import httpx
from ..config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Envia email via Brevo HTTP API (funciona en Railway)."""
    if settings.BREVO_API_KEY:
        return _send_via_brevo(to, subject, html_body)
    # Fallback a SMTP si no hay Brevo
    return _send_via_smtp(to, subject, html_body)


def _send_via_brevo(to: str, subject: str, html_body: str) -> bool:
    """Envia email usando Brevo API."""
    try:
        headers = {
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
            "accept": "application/json",
        }
        payload = {
            "sender": {"name": "OnboardIQ Aquarius", "email": settings.EMAIL_FROM},
            "to": [{"email": to}],
            "subject": subject,
            "htmlContent": html_body,
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(BREVO_API_URL, headers=headers, json=payload)

        if resp.status_code in (200, 201):
            logger.info(f"Email enviado via Brevo a {to}: {subject}")
            return True
        else:
            logger.error(f"Brevo error {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        logger.error(f"Error enviando via Brevo a {to}: {type(e).__name__}: {e}")
        return False


def _send_via_smtp(to: str, subject: str, html_body: str) -> bool:
    """Fallback: envia via Gmail SMTP."""
    if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
        logger.warning("Ni Brevo ni Gmail configurados. Email no enviado.")
        return False
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"OnboardIQ Aquarius <{settings.GMAIL_USER}>"
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))

        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        server.sendmail(settings.GMAIL_USER, to, msg.as_string())
        server.quit()
        logger.info(f"Email enviado via SMTP a {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Error SMTP a {to}: {type(e).__name__}: {e}")
        return False


def send_bulk_email(recipients: list[str], subject: str, html_body: str) -> dict:
    """Envia email a multiples destinatarios."""
    sent = 0
    failed = 0
    for recipient in recipients:
        if send_email(recipient, subject, html_body):
            sent += 1
        else:
            failed += 1
    return {"sent": sent, "failed": failed}


# ---- DB Template Loader ----

def _load_custom_template(tipo: str, variables: dict[str, str]) -> str | None:
    """Try to load a custom template from the DB. Returns rendered HTML or None."""
    try:
        from ..models.database import SessionLocal
        from ..models.email_plantilla import EmailPlantilla

        db = SessionLocal()
        try:
            plantilla = db.query(EmailPlantilla).filter(
                EmailPlantilla.tipo == tipo,
                EmailPlantilla.activa == True,
            ).first()
            if not plantilla:
                return None
            contenido = plantilla.contenido
            for key, value in variables.items():
                contenido = contenido.replace(key, value)
            return contenido
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Could not load custom template '{tipo}': {e}")
        return None


# ---- HTML Templates ----

def template_credenciales(nombre: str, email: str, password: str, puesto: str) -> str:
    custom = _load_custom_template("credenciales", {
        "{nombre}": nombre, "{email}": email, "{password}": password, "{puesto}": puesto,
    })
    if custom:
        return custom
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#0a1f3d,#1a7ec5);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">OnboardIQ Aquarius</h1>
            <p style="color:#3ec6e0;margin:5px 0 0;font-size:13px">Recruit System</p>
        </div>
        <div style="padding:30px">
            <h2 style="color:#0a1f3d;font-size:18px">Bienvenido/a, {nombre}!</h2>
            <p style="color:#64748b;font-size:14px">Se le ha creado una cuenta para el puesto de <strong>{puesto}</strong>.</p>
            <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #3ec6e0">
                <p style="margin:0 0 8px;font-size:14px;color:#334155"><strong>Sus credenciales:</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#64748b">Email: <strong style="color:#0a1f3d">{email}</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#64748b">Contrasena: <strong style="color:#0a1f3d">{password}</strong></p>
            </div>
            <a href="https://aquariusrecursos.vercel.app" style="display:inline-block;background:#1a7ec5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Ingresar al Sistema</a>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System | Powered by Aquarius Consulting 2026</p>
        </div>
    </div>"""


def template_bienvenida(nombre: str, puesto: str) -> str:
    custom = _load_custom_template("bienvenida", {"{nombre}": nombre, "{puesto}": puesto})
    if custom:
        return custom
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#0a1f3d,#10b981);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">Nuevo Colaborador</h1>
            <p style="color:#a7f3d0;margin:5px 0 0;font-size:13px">OnboardIQ Aquarius</p>
        </div>
        <div style="padding:30px">
            <h2 style="color:#0a1f3d;font-size:18px">Damos la bienvenida a {nombre}!</h2>
            <p style="color:#64748b;font-size:14px"><strong>{nombre}</strong> se incorpora al equipo como <strong>{puesto}</strong>.</p>
            <p style="color:#64748b;font-size:14px">Bienvenido/a a la familia Aquarius Consulting!</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
        </div>
    </div>"""


def template_cesado(nombre: str, puesto: str) -> str:
    custom = _load_custom_template("cesado", {"{nombre}": nombre, "{puesto}": puesto})
    if custom:
        return custom
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#0a1f3d,#64748b);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">Aviso al Personal</h1>
        </div>
        <div style="padding:30px">
            <p style="color:#64748b;font-size:14px"><strong>{nombre}</strong> ({puesto}) ha dejado de formar parte del equipo. Le deseamos exitos.</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
        </div>
    </div>"""


def template_cumpleanos(nombre: str) -> str:
    custom = _load_custom_template("cumpleanos", {"{nombre}": nombre})
    if custom:
        return custom
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:28px">Feliz Cumpleanos! 🎂🎉</h1>
        </div>
        <div style="padding:30px;text-align:center">
            <h2 style="color:#0a1f3d;font-size:20px">Felicitaciones, {nombre}!</h2>
            <p style="color:#64748b;font-size:14px">Todo el equipo de Aquarius Consulting te desea un muy feliz cumpleanos. 🥳🎈🎁</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
        </div>
    </div>"""


def template_festividad(nombre_festividad: str, mensaje: str) -> str:
    custom = _load_custom_template("festividad", {"{nombre_festividad}": nombre_festividad, "{mensaje}": mensaje})
    if custom:
        return custom
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#0a1f3d,#1a7ec5);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">{nombre_festividad}</h1>
        </div>
        <div style="padding:30px;text-align:center">
            <p style="color:#0a1f3d;font-size:16px;font-weight:600">{mensaje}</p>
            <p style="color:#64748b;font-size:14px">El equipo de Aquarius Consulting les desea un excelente dia.</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
        </div>
    </div>"""
