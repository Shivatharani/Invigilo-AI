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

from pydantic import BaseModel
from typing import Optional

class EndSessionRequest(BaseModel):
    session_id: str
    score: Optional[int] = None
    total_questions: Optional[int] = None

@router.post("/end-session")
def end_session(req: EndSessionRequest):
    update_data = {"end_time": datetime.utcnow(), "status": "completed"}
    if req.score is not None:
        update_data["score"] = req.score
    if req.total_questions is not None:
        update_data["total_questions"] = req.total_questions
        
    result = sessions_collection.update_one(
        {"session_id": req.session_id},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        return {"error": "Session not found or already ended"}, 404
        
    return {"message": "Session ended successfully"}
