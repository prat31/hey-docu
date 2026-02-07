from llama_index.core import VectorStoreIndex, get_response_synthesizer
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from app.services.vector_db import get_vector_store
from app.services.llm import configure_llm

def ask_question(question: str):
    configure_llm()
    
    vector_store = get_vector_store()
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
    
    # Create a query engine
    query_engine = index.as_query_engine(similarity_top_k=3)
    
    response = query_engine.query(question)
    return str(response)
