from fastapi import APIRouter
from database.db import sessions_collection
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/start-session")
def start_session(student_id: str, exam_id: str):
    session_id = str(uuid.uuid4())

    session = {
        "session_id": session_id,
        "student_id": student_id,
        "exam_id": exam_id,
        "start_time": datetime.utcnow(),
        "end_time": None,
        "status": "active"
    }

    sessions_collection.insert_one(session)

    return {"session_id": session_id}

@router.post("/end-session")
def end_session(session_id: str):
    result = sessions_collection.update_one(
        {"session_id": session_id},
        {"$set": {"end_time": datetime.utcnow(), "status": "completed"}}
    )
    if result.modified_count == 0:
        return {"error": "Session not found or already ended"}, 404
        
    return {"message": "Session ended successfully"}
