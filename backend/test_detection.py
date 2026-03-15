import cv2
import numpy as np
from detection.phone_detection import detect_phone
from detection.face_detection import detect_faces
import traceback

def main():
    image = np.zeros((480, 640, 3), dtype=np.uint8)
    try:
        print("Testing detect phone")
        phone = detect_phone(image)
        print("Phone detection successful, result:", phone)
    except Exception as e:
        print("Error in phone detection:", e)
        traceback.print_exc()

    try:
        print("Testing detect face")
        faces = detect_faces(image)
        print("Face detection successful, result:", faces)
    except Exception as e:
        print("Error in face detection:", e)
        traceback.print_exc()

if __name__ == "__main__":
    main()
