from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    username: str
    password: str
    role: str # "student" or "admin"

class UserResponse(BaseModel):
    id: str
    username: str
    role: str

class ExamSession(BaseModel):
    student_id: str
    exam_id: str
    start_time: datetime
    end_time: datetime | None = None
    status: str = "active" # "active" or "completed"
    score: int | None = None
    total_questions: int | None = None


class AnalysisEvent(BaseModel):
    session_id: str
    face_count: int
    looking_direction: str
    risk_score: int
    status: str
    timestamp: datetime

class Question(BaseModel):
    subject: str
    question: str
    options: list[str]
    answer: str
    difficulty: str

