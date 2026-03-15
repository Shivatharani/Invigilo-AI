from database.db import events_collection
from utils.serializer import serialize_list

def generate_session_report(session_id):
    events = list(events_collection.find({"session_id": session_id}))

    total_events = len(events)
    suspicious_events = len([e for e in events if e["status"] == "Suspicious"])

    serialized_events = serialize_list(events)

    return {
        "session_id": session_id,
        "total_events": total_events,
        "suspicious_events": suspicious_events,
        "events": serialized_events
    }
