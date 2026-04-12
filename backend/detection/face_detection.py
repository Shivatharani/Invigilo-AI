import cv2
import mediapipe as mp
import mediapipe.python.solutions as mp_solutions

mp_face = mp_solutions.face_detection
face_detection = mp_face.FaceDetection(min_detection_confidence=0.5)

def detect_faces(image):
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_detection.process(image_rgb)

    count = 0
    if results.detections:
        count = len(results.detections)

    return count
