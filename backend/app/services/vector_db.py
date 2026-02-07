import qdrant_client
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.core import StorageContext
from app.core.config import settings
from qdrant_client.http import models

def get_vector_store(collection_name: str = "documents"):
    client = qdrant_client.QdrantClient(
        host=settings.QDRANT_HOST,
        port=settings.QDRANT_PORT
    )
    
    vector_store = QdrantVectorStore(
        client=client, 
        collection_name=collection_name
    )
    
    return vector_store

def delete_document_by_name(filename: str, collection_name: str = "documents"):
    client = qdrant_client.QdrantClient(
        host=settings.QDRANT_HOST,
        port=settings.QDRANT_PORT
    )
    
    client.delete(
        collection_name=collection_name,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="filename",
                        match=models.MatchValue(value=filename)
                    )
                ]
            )
        )
    )

def get_storage_context(collection_name: str = "documents"):
    vector_store = get_vector_store(collection_name)
    return StorageContext.from_defaults(vector_store=vector_store)
