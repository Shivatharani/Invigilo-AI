def estimate_head_pose(face_count, gaze_direction):
    if face_count == 0:
        return "No Face"
    if face_count > 1:
        return "Multiple Faces"

    if gaze_direction in ["Left", "Right"]:
        return "Turned"

    return "Forward"
