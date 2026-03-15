from database.db import events_collection

def count_recent_suspicious(session_id):
    events = list(events_collection.find(
        {"session_id": session_id, "status": "Suspicious"}
    ))

    return len(events)
