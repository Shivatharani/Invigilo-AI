from fastapi import APIRouter
from services.report_service import generate_session_report

router = APIRouter()

@router.get("/report/{session_id}")
def get_report(session_id: str):
    return generate_session_report(session_id)
