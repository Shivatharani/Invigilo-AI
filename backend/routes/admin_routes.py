from fastapi import APIRouter
from database.db import users_collection, sessions_collection, events_collection
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/students")
def get_students():
    # Fetch all students and their session counts
    students = list(users_collection.find({"role": "student"}, {"password": 0, "face_encoding": 0}))
    
    result = []
    for s in students:
        s_id = str(s["_id"])
        username = s.get("username", "Unknown")
        sessions = list(sessions_collection.find({"student_id": username}))
        result.append({
            "id": s_id,
            "username": username,
            "total_sessions": len(sessions),
            "status": "Active" if any(sess.get("status") == "active" for sess in sessions) else "Inactive"
        })
    return result

@router.get("/dashboard-stats")
def get_dashboard_stats():
    # Get total students, total sessions, active sessions, and recent alerts for charts
    total_students = users_collection.count_documents({"role": "student"})
    total_sessions = sessions_collection.count_documents({})
    active_sessions = sessions_collection.count_documents({"status": "active"})
    
    # Simple aggregation for chart: sessions by day or past 7 days (mocked for simplicity here if no complex dates)
    # But since it's real data, let's group events by type for a pie chart
    events = list(events_collection.find({}, {"_id": 0, "reasons": 1}))
    violation_counts = {}
    total_alerts = 0
    for e in events:
        reasons = e.get("reasons", [])
        if reasons:
            for r in reasons:
                violation_counts[r] = violation_counts.get(r, 0) + 1
                total_alerts += 1
                
    chart_data = [{"name": k, "value": v} for k, v in violation_counts.items()]
    
    # Get recent sessions for a table
    recent_sessions_cur = sessions_collection.find().sort("start_time", -1).limit(10)
    recent_sessions = []
    for s in recent_sessions_cur:
        s["_id"] = str(s["_id"])
        recent_sessions.append(s)
        
    return {
        "total_students": total_students,
        "total_sessions": total_sessions,
        "active_sessions": active_sessions,
        "total_alerts": total_alerts,
        "violation_chart_data": chart_data,
        "recent_sessions": recent_sessions
    }

@router.get("/student/{username}/activities")
def get_student_activities(username: str):
    # Fetch all sessions for this student
    sessions = list(sessions_collection.find({"student_id": username}))
    session_ids = [s["session_id"] for s in sessions]
    
    # Fetch events for these sessions
    events = list(events_collection.find({"session_id": {"$in": session_ids}}).sort("timestamp", -1))
    
    # Serialize ObjectId
    for e in events:
        e["_id"] = str(e["_id"])
        
    return {"sessions": len(sessions), "events": events}
