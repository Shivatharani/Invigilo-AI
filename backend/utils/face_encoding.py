import cv2
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh

# Pre-selected key landmarks representing facial structure (eyes, nose, mouth, jaw)
KEY_LANDMARKS = [
    33, 133,  # left eye
    362, 263, # right eye
    1, 4,     # nose
    61, 291,  # mouth left/right
    0, 17,    # mouth top/bottom
    234, 454, # jaw left/right
    10, 152   # face top/bottom
]

def get_face_encoding(image):
    with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5) as face_mesh:
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(image_rgb)

        if not results.multi_face_landmarks:
            return None

        landmarks = results.multi_face_landmarks[0].landmark
        
        # Extract coordinates
        points = np.array([[landmarks[idx].x, landmarks[idx].y, landmarks[idx].z] for idx in KEY_LANDMARKS])
        
        # Normalize points by translating center to origin
        center = np.mean(points, axis=0)
        points = points - center
        
        # Normalize scale using the distance between jaw points (index 10 and 11 in our subset)
        jaw_width = np.linalg.norm(points[10] - points[11])
        if jaw_width == 0:
            return None
            
        points = points / jaw_width
        
        # Compute pairwise distances between all key points to form a feature vector
        num_points = len(KEY_LANDMARKS)
        feature_vector = []
        for i in range(num_points):
            for j in range(i + 1, num_points):
                dist = np.linalg.norm(points[i] - points[j])
                feature_vector.append(dist)
                
        return feature_vector

def compare_faces(encoding1, encoding2, threshold=0.15):
    if not encoding1 or not encoding2:
        return False
        
    vec1 = np.array(encoding1)
    vec2 = np.array(encoding2)
    
    distance = np.linalg.norm(vec1 - vec2)
    return distance < threshold, distance
