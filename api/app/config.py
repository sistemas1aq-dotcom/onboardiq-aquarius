from pydantic_settings import BaseSettings
from functools import lru_cache
from dotenv import load_dotenv
import os

# Cargar .env explicitamente con override para que funcione siempre
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"), override=True)


class Settings(BaseSettings):
    APP_NAME: str = "Aquarius RRHH API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DB_SERVER: str = "localhost"
    DB_NAME: str = "AquariusRRHH"
    DB_USER: str = ""
    DB_PASSWORD: str = ""
    DB_DRIVER: str = "ODBC Driver 17 for SQL Server"
    DB_TRUSTED_CONNECTION: bool = True

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
    def DATABASE_URL(self) -> str:
        if self.DB_TRUSTED_CONNECTION:
            return (
                f"mssql+pyodbc://{self.DB_SERVER}/{self.DB_NAME}"
                f"?driver={self.DB_DRIVER.replace(' ', '+')}"
                f"&Trusted_Connection=yes"
                f"&Encrypt=yes"
                f"&TrustServerCertificate=yes"
            )
        return (
            f"mssql+pyodbc://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_SERVER}/{self.DB_NAME}"
            f"?driver={self.DB_DRIVER.replace(' ', '+')}"
            f"&Encrypt=yes"
            f"&TrustServerCertificate=yes"
        )

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
