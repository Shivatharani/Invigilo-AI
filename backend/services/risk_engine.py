def calculate_risk(face_count, gaze_direction, phone_detected, suspicious_count):
    risk = 0
    reasons = []

    # 🚨 No face detected
    if face_count == 0:
        risk += 40
        reasons.append("No face detected")

    # 🚨 Multiple faces detected
    elif face_count > 1:
        risk += 50
        reasons.append("Multiple faces detected")

    # 👀 Looking away
    if gaze_direction in ["left", "right", "down"]:
        risk += 20
        reasons.append(f"Looking {gaze_direction}")

    # 📱 Phone detected
    if phone_detected:
        risk += 80
        reasons.append("Mobile phone detected")

    # 🔁 Repeated suspicious behavior
    if suspicious_count > 2:
        risk += 15
        reasons.append("Repeated suspicious behavior")

    # 🎯 Clamp risk between 0–100
    risk = min(risk, 100)

    # 🏷 Status Classification
    if risk < 30:
        status = "Normal"
    elif risk < 60:
        status = "Suspicious"
    else:
        status = "High Risk"

    return risk, status, reasons

