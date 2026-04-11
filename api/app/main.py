from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .routers import auth, dashboard, postulantes, evaluaciones, documentos, entrevistas, legajo, embudo, usuarios, seguridad, configuracion, ia, portal, carga_masiva, anuncios, comunicaciones, capacitaciones, evaluacion_desempeno, chat

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticacion"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(postulantes.router, prefix="/api/postulantes", tags=["Postulantes"])
app.include_router(evaluaciones.router, prefix="/api/evaluaciones", tags=["Evaluaciones"])
app.include_router(documentos.router, prefix="/api/documentos", tags=["Documentos"])
app.include_router(entrevistas.router, prefix="/api/entrevistas", tags=["Entrevistas"])
app.include_router(legajo.router, prefix="/api/legajo", tags=["Legajo"])
app.include_router(embudo.router, prefix="/api/embudo", tags=["Embudo"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["Usuarios"])
app.include_router(seguridad.router, prefix="/api/seguridad", tags=["Seguridad"])
app.include_router(configuracion.router, prefix="/api/configuracion", tags=["Configuracion"])
app.include_router(ia.router, prefix="/api/ia", tags=["IA"])
app.include_router(portal.router, prefix="/api/portal", tags=["Portal"])
app.include_router(carga_masiva.router, prefix="/api/carga-masiva", tags=["Carga Masiva"])
app.include_router(anuncios.router, prefix="/api/anuncios", tags=["Anuncios"])
app.include_router(comunicaciones.router, prefix="/api/comunicaciones", tags=["Comunicaciones"])
app.include_router(capacitaciones.router, prefix="/api/capacitaciones", tags=["Capacitaciones"])
app.include_router(evaluacion_desempeno.router, prefix="/api/evaluacion-desempeno", tags=["Evaluacion Desempeno"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
