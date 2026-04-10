from pydantic import BaseModel
from typing import Optional, Any, List


class CVAnalysisRequest(BaseModel):
    postulante_id: int
    cv_text: str
    puesto: Optional[str] = None


class ScoringRequest(BaseModel):
    postulante_id: int
    puesto: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class IAAnalysisResponse(BaseModel):
    id: int
    postulante_id: int
    tipo: str
    resultado: Optional[Any] = None
    score: Optional[int] = None

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = None
