from llama_index.core import Settings
from llama_index.llms.openai import OpenAI
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
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
    # Use a local embedding model to save costs/latency or match Ollama
    # allowing it to be self-hosted 
    Settings.embed_model = HuggingFaceEmbedding(
        model_name="BAAI/bge-small-en-v1.5"
    )
