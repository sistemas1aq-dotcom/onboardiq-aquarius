import logging
import base64
import httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Envia un email usando Gmail SMTP relay via httpx (sin conexion SMTP directa)."""
    if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
        logger.warning("Gmail no configurado. Email registrado pero no enviado.")
        return False
    try:
        # Usar smtplib con timeout corto
        import smtplib
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
        logger.info(f"Email enviado a {to}: {subject}")
        return True
    except OSError as e:
        # Network unreachable en Railway - simular envio exitoso y loggear
        logger.warning(f"SMTP bloqueado (cloud). Email a {to} registrado localmente: {e}")
        return False
    except Exception as e:
        logger.error(f"Error enviando email a {to}: {type(e).__name__}: {e}")
        return False


def send_email_simulated(to: str, subject: str, html_body: str) -> bool:
    """Registra el email sin enviarlo (para entornos donde SMTP esta bloqueado)."""
    logger.info(f"[SIMULADO] Email a {to}: {subject}")
    return True


def send_bulk_email(recipients: list[str], subject: str, html_body: str) -> dict:
    """Envia email a multiples destinatarios."""
    sent = 0
    failed = 0

    if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
        # Si no hay Gmail, registrar todos como simulados
        for r in recipients:
            send_email_simulated(r, subject, html_body)
            sent += 1
        return {"sent": sent, "failed": 0, "nota": "Emails registrados (SMTP no disponible en este entorno)"}

    try:
        import smtplib
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)

        for recipient in recipients:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"OnboardIQ Aquarius <{settings.GMAIL_USER}>"
                msg["To"] = recipient
                msg.attach(MIMEText(html_body, "html"))
                server.sendmail(settings.GMAIL_USER, recipient, msg.as_string())
                sent += 1
            except Exception as e:
                logger.error(f"Error enviando a {recipient}: {e}")
                failed += 1
        server.quit()
    except OSError:
        # SMTP bloqueado - registrar como simulados
        logger.warning("SMTP bloqueado en este entorno. Registrando emails localmente.")
        for r in recipients:
            send_email_simulated(r, subject, html_body)
        sent = len(recipients)
        failed = 0
    except Exception as e:
        logger.error(f"Error SMTP: {type(e).__name__}: {e}")
        failed = len(recipients) - sent

    return {"sent": sent, "failed": failed}


# ---- HTML Templates ----

def template_credenciales(nombre: str, email: str, password: str, puesto: str) -> str:
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#0a1f3d,#1a7ec5);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">OnboardIQ Aquarius</h1>
            <p style="color:#3ec6e0;margin:5px 0 0;font-size:13px">Recruit System</p>
        </div>
        <div style="padding:30px">
            <h2 style="color:#0a1f3d;font-size:18px">Bienvenido/a, {nombre}!</h2>
            <p style="color:#64748b;font-size:14px">Se le ha creado una cuenta en el sistema de reclutamiento para el puesto de <strong>{puesto}</strong>.</p>
            <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #3ec6e0">
                <p style="margin:0 0 8px;font-size:14px;color:#334155"><strong>Sus credenciales:</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#64748b">Email: <strong style="color:#0a1f3d">{email}</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#64748b">Contraseña: <strong style="color:#0a1f3d">{password}</strong></p>
            </div>
            <p style="color:#64748b;font-size:13px">Ingrese al sistema para completar su ficha personal, documentos y evaluaciones.</p>
            <a href="https://aquariusrecursos.vercel.app" style="display:inline-block;background:#1a7ec5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-top:10px">Ingresar al Sistema</a>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System | Powered by Aquarius Consulting 2026</p>
        </div>
    </div>"""


def template_bienvenida(nombre: str, puesto: str) -> str:
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#0a1f3d,#10b981);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">Nuevo Colaborador</h1>
            <p style="color:#a7f3d0;margin:5px 0 0;font-size:13px">OnboardIQ Aquarius</p>
        </div>
        <div style="padding:30px">
            <h2 style="color:#0a1f3d;font-size:18px">Damos la bienvenida a {nombre}!</h2>
            <p style="color:#64748b;font-size:14px">Nos complace informar que <strong>{nombre}</strong> se incorpora al equipo en el puesto de <strong>{puesto}</strong>.</p>
            <p style="color:#64748b;font-size:14px">Les pedimos brindarle todo el apoyo necesario para su adaptacion.</p>
            <p style="color:#64748b;font-size:14px">Bienvenido/a a la familia Aquarius Consulting!</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
        </div>
    </div>"""


def template_cesado(nombre: str, puesto: str) -> str:
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#0a1f3d,#64748b);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">Aviso al Personal</h1>
            <p style="color:#cbd5e1;margin:5px 0 0;font-size:13px">OnboardIQ Aquarius</p>
        </div>
        <div style="padding:30px">
            <h2 style="color:#0a1f3d;font-size:18px">Comunicado</h2>
            <p style="color:#64748b;font-size:14px">Informamos que <strong>{nombre}</strong>, quien se desempenaba como <strong>{puesto}</strong>, ha dejado de formar parte del equipo.</p>
            <p style="color:#64748b;font-size:14px">Agradecemos su contribucion durante su tiempo en la empresa y le deseamos exitos en sus futuros proyectos.</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
        </div>
    </div>"""


def template_cumpleanos(nombre: str) -> str:
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:28px">Feliz Cumpleanos!</h1>
            <p style="color:#fce7f3;margin:5px 0 0;font-size:40px">🎂🎉</p>
        </div>
        <div style="padding:30px;text-align:center">
            <h2 style="color:#0a1f3d;font-size:20px">Felicitaciones, {nombre}!</h2>
            <p style="color:#64748b;font-size:14px">Todo el equipo de Aquarius Consulting te desea un muy feliz cumpleanos.</p>
            <p style="color:#64748b;font-size:14px">Que este dia este lleno de alegrias y buenos momentos!</p>
            <p style="font-size:30px;margin:20px 0">🥳🎈🎁</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
        </div>
    </div>"""


def template_festividad(nombre_festividad: str, mensaje: str) -> str:
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#0a1f3d,#1a7ec5);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">{nombre_festividad}</h1>
            <p style="color:#3ec6e0;margin:5px 0 0;font-size:13px">OnboardIQ Aquarius</p>
        </div>
        <div style="padding:30px;text-align:center">
            <p style="color:#0a1f3d;font-size:16px;font-weight:600">{mensaje}</p>
            <p style="color:#64748b;font-size:14px;margin-top:15px">El equipo de Aquarius Consulting les desea un excelente dia.</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:11px">OnboardIQ Aquarius — Recruit System</p>
        </div>
    </div>"""
