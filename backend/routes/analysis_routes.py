from fastapi import APIRouter, UploadFile, File, Form
import numpy as np
import cv2
from datetime import datetime

from detection.face_detection import detect_faces
from detection.gaze_tracking import detect_gaze
from detection.head_pose import estimate_head_pose
from detection.phone_detection import detect_phone
from services.risk_engine import calculate_risk
from services.behavior_tracker import count_recent_suspicious
from database.db import events_collection, sessions_collection, users_collection
from utils.image_utils import save_image
from utils.serializer import serialize_mongo
from utils.face_encoding import get_face_encoding, compare_faces

router = APIRouter()

@router.post("/analyze")
async def analyze(
    session_id: str = Form(...),
    file: UploadFile = File(...)
):
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    

    face_count = detect_faces(image)
    gaze_direction = detect_gaze(image)
    head_pose = estimate_head_pose(face_count, gaze_direction)
    phone_detected = detect_phone(image)

    suspicious_count = count_recent_suspicious(session_id)

    risk_score, status, reasons = calculate_risk(
        face_count,
        gaze_direction,
        phone_detected,
        suspicious_count
    )

    # Face matching logic
    if face_count == 1:
        session = sessions_collection.find_one({"session_id": session_id})
        if session:
            student_id = session.get("student_id")
            user = users_collection.find_one({"username": student_id})
            if user and user.get("face_encoding"):
                current_encoding = get_face_encoding(image)
                if current_encoding:
                    is_match, _ = compare_faces(user["face_encoding"], current_encoding)
                    if not is_match:
                        risk_score += 50
                        reasons.append("Unrecognized face detected")
                        status = "High Risk"

    image_path = save_image(image)

    event = {
        "session_id": session_id,
        "face_count": face_count,
        "gaze_direction": gaze_direction,
        "head_pose": head_pose,
        "phone_detected": phone_detected,
        "risk_score": risk_score,
        "status": status,
        "reasons": reasons,
        "image_path": image_path,
        "timestamp": datetime.utcnow()
    }

    result = events_collection.insert_one(event)
    event["_id"] = str(result.inserted_id)

    return event

from pydantic import BaseModel
from typing import Optional

class BrowserEventReq(BaseModel):
    session_id: str
    event_type: str
    details: Optional[str] = None

@router.post("/log-event")
async def log_event(req: BrowserEventReq):
    # Assign risk based on event type
    risk_score = 80
    if req.event_type in ["Exited Fullscreen", "Tab Switched", "Window Lost Focus"]:
        risk_score = 65
    elif req.event_type in ["Copy Attempt", "Paste Attempt", "Right Click Attempt"]:
        risk_score = 50
    elif req.event_type == "Audio Violation: Speech Detected":
        risk_score = 85

    event = {
        "session_id": req.session_id,
        "face_count": 1, # Default assumption for non-camera events
        "gaze_direction": "Forward",
        "head_pose": "Center",
        "phone_detected": False,
        "risk_score": risk_score,
        "status": "Suspicious",
        "reasons": [req.event_type],
        "image_path": None,
        "details": req.details,
        "timestamp": datetime.utcnow()
    }

    result = events_collection.insert_one(event)
    event["_id"] = str(result.inserted_id)
    return {"status": "success", "event": event}
