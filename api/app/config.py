from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "Aquarius RRHH API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = ""
    DB_SERVER: str = "localhost"
    DB_NAME: str = "AquariusRRHH"
    DB_USER: str = ""
    DB_PASSWORD: str = ""

    # JWT
    SECRET_KEY: str = "aquarius-rrhh-secret-key-2026-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 horas

    # CORS
    CORS_ORIGINS: str = "http://localhost:4200,http://localhost:8000,https://aquarius-rrhh.vercel.app"

    # AI
    ANTHROPIC_API_KEY: str = ""
    AI_MODEL_CHAT: str = "claude-haiku-4-5-20251001"
    AI_MODEL_ANALYSIS: str = "claude-sonnet-4-6-20250514"

    @property
    def database_url(self) -> str:
        """Retorna la URL de conexion a PostgreSQL.
        Si DATABASE_URL esta seteada (Neon/Vercel), la usa directamente.
        Sino, construye la URL desde las variables individuales (dev local).
        """
        if self.DATABASE_URL:
            return self.DATABASE_URL
        if self.DB_USER and self.DB_PASSWORD:
            return (
                f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
                f"@{self.DB_SERVER}/{self.DB_NAME}"
            )
        return f"postgresql://{self.DB_SERVER}/{self.DB_NAME}"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
