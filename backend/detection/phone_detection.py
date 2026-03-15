from ultralytics import YOLO
import cv2

# Load the YOLOv8 model (downloads automatically if not present)
model = YOLO('yolov8n.pt')

def detect_phone(image):
    # Run inference on the image
    results = model(image, verbose=False)
    
    # Check if a cell phone (class 67 in COCO dataset) is detected
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls = int(box.cls[0])
            if cls == 67: # 67 is cell phone in COCO
                return True
    return False
