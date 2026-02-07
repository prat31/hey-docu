from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.worker import process_document_task, celery_app
from app.services.rag import ask_question
from pydantic import BaseModel
import shutil
import os
import uuid

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    ALLOWED_EXTENSIONS = {'.txt', '.pdf', '.docx', '.md', '.csv'}
    import os
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Supported types: {ALLOWED_EXTENSIONS}")
    
    temp_dir = "/app/temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = f"{temp_dir}/{uuid.uuid4()}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    task = process_document_task.delay(file_path, file.filename)
    
    return {"task_id": task.id, "filename": file.filename, "status": "processing_started"}

@router.get("/task/{task_id}")
def get_task_status(task_id: str):
    task_result = celery_app.AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result
    }

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        import redis
        from app.core.config import settings
        r = redis.Redis.from_url(settings.CELERY_BROKER_URL)
        if r.scard("ingested_files") == 0:
            return {"answer": "Please upload a document to start chatting with it."}

        answer = ask_question(request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files")
def list_files():
    import redis
    from app.core.config import settings
    r = redis.Redis.from_url(settings.CELERY_BROKER_URL)
    files = r.smembers("ingested_files")
    return {"files": [f.decode('utf-8') for f in files]}

@router.delete("/files/{filename}")
def delete_file(filename: str):
    import redis
    from app.core.config import settings
    from app.services.vector_db import delete_document_by_name
    
    try:
        delete_document_by_name(filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete from VectorDB: {str(e)}")

    r = redis.Redis.from_url(settings.CELERY_BROKER_URL)
    r.srem("ingested_files", filename)
    
    return {"status": "success", "filename": filename}

@router.get("/status")
def get_system_status():
    from app.core.config import settings
    from app.services.llm import check_connection
    
    is_online = check_connection()
    
    return {
        "llm_provider": settings.LLM_PROVIDER,
        "model": settings.OLLAMA_MODEL if settings.LLM_PROVIDER == "ollama" else "gpt-3.5-turbo",
        "vector_db": "Qdrant",
        "is_online": is_online
    }
