from .database import Base, get_db, engine
from .usuario import Usuario
from .postulante import Postulante, FichaPersonal
from .evaluacion import Evaluacion, Pregunta, EvaluacionPostulante, Respuesta
from .documento import Documento
from .entrevista import Entrevista
from .firma import FirmaDigital
from .derechohabiente import Derechohabiente
from .bancario import DatoBancario
from .pensionario import RegimenPensionario
from .capacitacion import Capacitacion, CapacitacionTrabajador
from .auditoria import Auditoria
from .configuracion import Configuracion
from .ia_analisis import IAAnalisis
from .anuncio import Anuncio
from .comunicacion import ComunicacionLog
from .festividad import Festividad
