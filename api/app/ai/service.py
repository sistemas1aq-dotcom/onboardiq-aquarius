import json
from ..config import get_settings

settings = get_settings()

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not settings.ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY no esta configurada. "
            "Configure la variable de entorno o el archivo .env."
        )
    try:
        import anthropic
        _client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        return _client
    except ImportError:
        raise RuntimeError(
            "La libreria 'anthropic' no esta instalada. "
            "Ejecute: pip install anthropic"
        )


def analyze_cv(cv_text: str, puesto: str | None = None) -> dict:
    client = _get_client()
    puesto_ctx = f" para el puesto de {puesto}" if puesto else ""
    message = client.messages.create(
        model=settings.AI_MODEL_ANALYSIS,
        max_tokens=2048,
        messages=[
            {
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
            }
        ],
    )
    text = message.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw_response": text, "score": 0}


def calculate_scoring(postulante_data: dict, puesto: str) -> dict:
    client = _get_client()
    message = client.messages.create(
        model=settings.AI_MODEL_ANALYSIS,
        max_tokens=1024,
        messages=[
            {
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
            }
        ],
    )
    text = message.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw_response": text, "score_general": 0}


def get_insights(postulante_data: dict) -> dict:
    client = _get_client()
    message = client.messages.create(
        model=settings.AI_MODEL_ANALYSIS,
        max_tokens=1024,
        messages=[
            {
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
            }
        ],
    )
    text = message.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw_response": text}


def chat_response(message: str, context: str | None = None) -> str:
    client = _get_client()
    system_prompt = (
        "Eres un asistente de RRHH de Aquarius Consulting SAC, una empresa "
        "peruana de consultoria. Ayudas con consultas sobre procesos de seleccion, "
        "evaluacion de personal, legislacion laboral peruana, y gestion de recursos "
        "humanos en general. Responde de forma clara, concisa y profesional en espanol."
    )
    if context:
        system_prompt += f"\n\nContexto adicional:\n{context}"
    response = client.messages.create(
        model=settings.AI_MODEL_CHAT,
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": message}],
    )
    return response.content[0].text
