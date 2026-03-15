import requests
import json
import numpy as np
import cv2

def test_log_event():
    url = "http://127.0.0.1:8000/log-event"
    payload = {
        "session_id": "test_session_123",
        "event_type": "Tab Switched",
        "details": "User switched tab"
    }
    response = requests.post(url, json=payload)
    print("Log Event Response:", response.status_code, response.text)

def test_analyze():
    url = "http://127.0.0.1:8000/analyze"
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    _, img_encoded = cv2.imencode('.jpg', img)
    files = {'file': ('test.jpg', img_encoded.tobytes(), 'image/jpeg')}
    data = {'session_id': 'test_session_123'}
    response = requests.post(url, data=data, files=files)
    print("Analyze Response:", response.status_code, response.text)

if __name__ == "__main__":
    test_log_event()
    test_analyze()
