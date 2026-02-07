from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hey Docu"
    API_V1_STR: str = "/api/v1"
    
    # Cors
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Celery
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    # Qdrant
    QDRANT_HOST: str
    QDRANT_PORT: int = 6333

    # LLM
    LLM_PROVIDER: str = "openai"
    OPENAI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: Optional[str] = None
    OLLAMA_MODEL: str = "llama3"
    OLLAMA_EMBED_MODEL: Optional[str] = None
    DISABLE_HF_EMBEDDINGS: bool = False

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
