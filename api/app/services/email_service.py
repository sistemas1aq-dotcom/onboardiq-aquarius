import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Envia un email individual via Gmail SMTP."""
    if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
        logger.warning("Gmail no configurado. Email no enviado.")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"OnboardIQ Aquarius <{settings.GMAIL_USER}>"
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))

        logger.info(f"Conectando a Gmail SMTP para enviar a {to}...")
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        server.sendmail(settings.GMAIL_USER, to, msg.as_string())
        server.quit()

        logger.info(f"Email enviado exitosamente a {to}: {subject}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"Error de autenticacion Gmail: {e}")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"Error SMTP enviando a {to}: {e}")
        return False
    except Exception as e:
        logger.error(f"Error general enviando email a {to}: {type(e).__name__}: {e}")
        return False


def send_bulk_email(recipients: list[str], subject: str, html_body: str) -> dict:
    """Envia email a multiples destinatarios. Retorna conteo de enviados/fallidos."""
    sent = 0
    failed = 0
    if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
        return {"sent": 0, "failed": len(recipients), "error": "Gmail no configurado"}
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
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
                logger.info(f"Email enviado a {recipient}")
            except Exception as e:
                logger.error(f"Error enviando email a {recipient}: {e}")
                failed += 1
        server.quit()
    except Exception as e:
        logger.error(f"Error conectando a SMTP: {type(e).__name__}: {e}")
        failed = len(recipients) - sent

    return {"sent": sent, "failed": failed}


# ---- HTML Templates ----

_STYLE_BASE = """
<style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f6f9; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0a1f3d, #1a3a6c); padding: 30px; text-align: center; }
    .header h1 { color: #3ec6e0; margin: 0; font-size: 24px; }
    .header p { color: #a0b4cc; margin: 5px 0 0; font-size: 13px; }
    .body { padding: 30px; color: #333; line-height: 1.6; }
    .body h2 { color: #0a1f3d; margin-top: 0; }
    .highlight { background: #eaf7fa; border-left: 4px solid #3ec6e0; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .btn { display: inline-block; background: #3ec6e0; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    .footer { background: #0a1f3d; padding: 20px; text-align: center; color: #a0b4cc; font-size: 12px; }
    .footer a { color: #3ec6e0; text-decoration: none; }
    .credential { font-family: monospace; background: #f0f0f0; padding: 3px 8px; border-radius: 3px; }
</style>
"""


def _wrap_template(content: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">{_STYLE_BASE}</head>
<body>
<div class="container">
    <div class="header">
        <h1>Aquarius Operaciones</h1>
        <p>Sistema de Recursos Humanos</p>
    </div>
    <div class="body">
        {content}
    </div>
    <div class="footer">
        <p>Aquarius Operaciones S.A.C. &mdash; Gestion de Recursos Humanos</p>
        <p>Este es un mensaje automatico, por favor no responda a este correo.</p>
    </div>
</div>
</body>
</html>"""


def template_credenciales(nombre: str, email: str, password: str, puesto: str) -> str:
    content = f"""
    <h2>Bienvenido(a), {nombre}</h2>
    <p>Se ha creado tu cuenta en el sistema <strong>OnboardIQ Aquarius</strong> para el puesto de <strong>{puesto}</strong>.</p>
    <div class="highlight">
        <p><strong>Tus credenciales de acceso:</strong></p>
        <p>Email: <span class="credential">{email}</span></p>
        <p>Contrasena: <span class="credential">{password}</span></p>
    </div>
    <p>Por favor, ingresa al sistema y cambia tu contrasena en tu primer acceso.</p>
    <p style="text-align:center;">
        <a class="btn" href="https://aquarius-rrhh.vercel.app">Ingresar al Sistema</a>
    </p>
    <p>Si tienes alguna duda, contacta al area de Recursos Humanos.</p>
    """
    return _wrap_template(content)


def template_bienvenida(nombre: str, puesto: str) -> str:
    content = f"""
    <h2>Nuevo integrante en el equipo</h2>
    <p>Nos complace informar que <strong>{nombre}</strong> se ha incorporado al equipo de Aquarius Operaciones en el puesto de <strong>{puesto}</strong>.</p>
    <div class="highlight">
        <p>Les pedimos darle la bienvenida y todo el apoyo necesario para su integracion en la empresa.</p>
    </div>
    <p>Saludos cordiales,<br><strong>Recursos Humanos</strong></p>
    """
    return _wrap_template(content)


def template_cesado(nombre: str, puesto: str) -> str:
    content = f"""
    <h2>Comunicado al personal</h2>
    <p>Informamos que <strong>{nombre}</strong>, quien desempenaba el puesto de <strong>{puesto}</strong>, ha dejado de formar parte del equipo de Aquarius Operaciones.</p>
    <div class="highlight">
        <p>Agradecemos su contribucion durante su tiempo en la empresa y le deseamos exitos en sus futuros proyectos.</p>
    </div>
    <p>Saludos cordiales,<br><strong>Recursos Humanos</strong></p>
    """
    return _wrap_template(content)


def template_cumpleanos(nombre: str) -> str:
    content = f"""
    <h2>Feliz Cumpleanos, {nombre}!</h2>
    <p>Todo el equipo de <strong>Aquarius Operaciones</strong> te desea un muy feliz cumpleanos.</p>
    <div class="highlight">
        <p>Esperamos que este dia este lleno de alegria y que el ano que comienza traiga muchos exitos personales y profesionales.</p>
    </div>
    <p style="text-align:center; font-size: 32px;">&#127874; &#127881; &#127880;</p>
    <p>Con los mejores deseos,<br><strong>Recursos Humanos</strong></p>
    """
    return _wrap_template(content)


def template_festividad(nombre_festividad: str, mensaje: str) -> str:
    content = f"""
    <h2>{nombre_festividad}</h2>
    <p>{mensaje}</p>
    <div class="highlight">
        <p>Todo el equipo de <strong>Aquarius Operaciones</strong> les desea una excelente celebracion.</p>
    </div>
    <p>Saludos cordiales,<br><strong>Recursos Humanos</strong></p>
    """
    return _wrap_template(content)
