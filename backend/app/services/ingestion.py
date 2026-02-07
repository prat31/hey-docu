import os
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
from app.services.vector_db import get_storage_context, get_vector_store
from app.services.llm import configure_llm

def ingest_document(file_path: str, filename: str):
    configure_llm()
    
    reader = SimpleDirectoryReader(input_files=[file_path])
    documents = reader.load_data()
    
    for doc in documents:
        doc.metadata["filename"] = filename

    storage_context = get_storage_context()
    
    VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        show_progress=True
    )
    
    return len(documents)
