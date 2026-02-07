from celery import Celery
from app.core.config import settings
import os
from app.services.ingestion import ingest_document

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(bind=True)
def process_document_task(self, file_path: str, filename: str):
    try:
        doc_count = ingest_document(file_path, filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            
        import redis
        r = redis.Redis.from_url(settings.CELERY_BROKER_URL)
        r.sadd("ingested_files", filename)

        return {"status": "success", "info": f"Ingested {doc_count} chunks from {filename}"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
