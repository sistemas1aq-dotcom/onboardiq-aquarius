import json
import httpx
from ..config import get_settings

settings = get_settings()

API_URL = "https://api.anthropic.com/v1/messages"


def _call_claude(messages: list, system: str = "", model: str = "", max_tokens: int = 2048) -> str:
    """Llama a la API de Claude directamente via HTTP (sin SDK pesado)."""
    if not settings.ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY no esta configurada. "
            "Configure la variable de entorno o el archivo .env."
        )

    use_model = model or settings.AI_MODEL_ANALYSIS

    headers = {
        "x-api-key": settings.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    body = {
        "model": use_model,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if system:
        body["system"] = system

    with httpx.Client(timeout=60.0) as client:
        resp = client.post(API_URL, headers=headers, json=body)

    if resp.status_code != 200:
        error_detail = resp.json().get("error", {}).get("message", resp.text)
        raise RuntimeError(f"Claude API error ({resp.status_code}): {error_detail}")

    data = resp.json()
    return data["content"][0]["text"].strip()


def _parse_json(text: str) -> dict:
    """Extrae JSON de la respuesta, removiendo code fences si existen."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"raw_response": text, "score": 0}


def analyze_cv(cv_text: str, puesto: str | None = None) -> dict:
    puesto_ctx = f" para el puesto de {puesto}" if puesto else ""
    text = _call_claude(
        messages=[{
            "role": "user",
            "content": (
                f"Analiza el siguiente CV de un postulante{puesto_ctx} en una "
                f"empresa peruana de consultoria (Aquarius Consulting SAC). "
                f"Devuelve un JSON con las siguientes claves:\n"
                f"- fortalezas: lista de fortalezas encontradas\n"
                f"- debilidades: lista de debilidades o areas de mejora\n"
                f"- experiencia_relevante: resumen de experiencia relevante\n"
                f"- educacion: resumen de formacion academica\n"
                f"- habilidades_clave: lista de habilidades principales\n"
                f"- recomendacion: texto con recomendacion general\n"
                f"- score: puntaje del 0 al 100\n\n"
                f"CV:\n{cv_text}\n\n"
                f"Responde SOLO con el JSON, sin texto adicional."
            ),
        }],
    )
    return _parse_json(text)


def calculate_scoring(postulante_data: dict, puesto: str) -> dict:
    text = _call_claude(
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": (
                f"Evalua al siguiente postulante para el puesto de '{puesto}' "
                f"en Aquarius Consulting SAC (Peru). Devuelve un JSON con:\n"
                f"- score_general: puntaje del 0 al 100\n"
                f"- score_experiencia: puntaje del 0 al 100\n"
                f"- score_educacion: puntaje del 0 al 100\n"
                f"- score_habilidades: puntaje del 0 al 100\n"
                f"- nivel_riesgo: 'bajo', 'medio' o 'alto'\n"
                f"- justificacion: texto explicativo\n\n"
                f"Datos del postulante:\n{json.dumps(postulante_data, ensure_ascii=False, default=str)}\n\n"
                f"Responde SOLO con el JSON."
            ),
        }],
    )
    return _parse_json(text)


def get_insights(postulante_data: dict) -> dict:
    text = _call_claude(
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": (
                f"Genera insights y recomendaciones para el siguiente postulante "
                f"en proceso de seleccion de Aquarius Consulting SAC. "
                f"Devuelve un JSON con:\n"
                f"- resumen: resumen ejecutivo del postulante\n"
                f"- alertas: lista de posibles alertas o banderas rojas\n"
                f"- oportunidades: lista de oportunidades o puntos fuertes\n"
                f"- recomendaciones: lista de acciones recomendadas\n"
                f"- compatibilidad: texto sobre compatibilidad con la empresa\n\n"
                f"Datos:\n{json.dumps(postulante_data, ensure_ascii=False, default=str)}\n\n"
                f"Responde SOLO con el JSON."
            ),
        }],
    )
    return _parse_json(text)


def chat_response(message: str, context: str | None = None) -> str:
    system_prompt = (
        "Eres un asistente de RRHH de Aquarius Consulting SAC, una empresa "
        "peruana de consultoria. Ayudas con consultas sobre procesos de seleccion, "
        "evaluacion de personal, legislacion laboral peruana, y gestion de recursos "
        "humanos en general. Responde de forma clara, concisa y profesional en espanol."
    )
    if context:
        system_prompt += f"\n\nContexto adicional:\n{context}"

    return _call_claude(
        model=settings.AI_MODEL_CHAT,
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": message}],
    )
