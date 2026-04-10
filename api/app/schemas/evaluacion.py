from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any


class EvaluacionBase(BaseModel):
    nombre: str
    tipo: str
    descripcion: Optional[str] = None
    duracion_minutos: Optional[int] = 60
    puntaje_minimo: Optional[int] = 60


class EvaluacionCreate(EvaluacionBase):
    pass


class EvaluacionResponse(EvaluacionBase):
    id: int
    activa: bool
    fecha_creacion: Optional[datetime] = None
    preguntas_count: Optional[int] = 0

    class Config:
        from_attributes = True


class PreguntaBase(BaseModel):
    pregunta: str
    opciones: Any  # JSON array
    respuesta_correcta: int
    puntaje: Optional[int] = 20
    orden: Optional[int] = 0


class PreguntaCreate(PreguntaBase):
    evaluacion_id: int


class PreguntaResponse(PreguntaBase):
    id: int
    evaluacion_id: int

    class Config:
        from_attributes = True


class AsignarEvaluacionRequest(BaseModel):
    evaluacion_id: int
    postulante_id: int
    evaluador_id: Optional[int] = None


class RespuestaSubmit(BaseModel):
    pregunta_id: int
    respuesta_seleccionada: int


class EvaluacionSubmitRequest(BaseModel):
    evaluacion_postulante_id: int
    respuestas: List[RespuestaSubmit]


class EvaluacionPostulanteResponse(BaseModel):
    id: int
    evaluacion_id: int
    postulante_id: int
    evaluador_id: Optional[int] = None
    puntaje_obtenido: Optional[int] = None
    estado: str
    fecha_asignacion: Optional[datetime] = None
    fecha_completado: Optional[datetime] = None
    comentario_evaluador: Optional[str] = None
    evaluacion_nombre: Optional[str] = None
    evaluacion_tipo: Optional[str] = None

    class Config:
        from_attributes = True
