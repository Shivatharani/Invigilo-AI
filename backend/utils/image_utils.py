import os
import uuid
from core.config import UPLOAD_FOLDER

def save_image(image):
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    filename = f"{uuid.uuid4()}.jpg"
    path = os.path.join(UPLOAD_FOLDER, filename)

    import cv2
    cv2.imwrite(path, image)

    return path
