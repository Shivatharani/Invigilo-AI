import cv2
import mediapipe as mp
import mediapipe.python.solutions as mp_solutions

mp_face_mesh = mp_solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

def detect_gaze(image):
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(image_rgb)

    if not results.multi_face_landmarks:
        return "No Face"

    face_landmarks = results.multi_face_landmarks[0]

    # Iris landmarks
    left_iris = face_landmarks.landmark[468]
    right_iris = face_landmarks.landmark[473]

    # Simple horizontal comparison
    if left_iris.x < 0.3:
        return "Left"
    elif left_iris.x > 0.7:
        return "Right"
    else:
        return "Forward"
