from llama_index.core import Settings
from llama_index.llms.openai import OpenAI
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.embeddings.ollama import OllamaEmbedding
import requests
from app.core.config import settings

def get_llm():
    if settings.LLM_PROVIDER == "openai":
        return OpenAI(api_key=settings.OPENAI_API_KEY, model="gpt-3.5-turbo")
    elif settings.LLM_PROVIDER == "ollama":
        return Ollama(
            model=settings.OLLAMA_MODEL, 
            base_url=settings.OLLAMA_BASE_URL,
            request_timeout=120.0
        )
    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {settings.LLM_PROVIDER}")

def configure_llm():
    Settings.llm = get_llm()
    
    # Check if a specific Ollama embedding model is requested
    if settings.OLLAMA_EMBED_MODEL:
        Settings.embed_model = OllamaEmbedding(
            model_name=settings.OLLAMA_EMBED_MODEL,
            base_url=settings.OLLAMA_BASE_URL
        )
    # If explicitly disabled, DO NOT fallback to HuggingFace
    elif settings.DISABLE_HF_EMBEDDINGS:
        raise ValueError("HuggingFace embeddings are disabled (DISABLE_HF_EMBEDDINGS=True) but no OLLAMA_EMBED_MODEL is set.")
    else:
        # Default fallback for convenience, connects to HF Hub once
        Settings.embed_model = HuggingFaceEmbedding(
            model_name="BAAI/bge-small-en-v1.5"
        )

def check_connection():
    try:
        if settings.LLM_PROVIDER == "ollama":
            # Simple check to Ollama API
            resp = requests.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=2)
            return resp.status_code == 200
        elif settings.LLM_PROVIDER == "openai":
            # Simple check to OpenAI API (listing models)
            headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
            resp = requests.get("https://api.openai.com/v1/models", headers=headers, timeout=5)
            return resp.status_code == 200
        return False
    except Exception:
        return False
