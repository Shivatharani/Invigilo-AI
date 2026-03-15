# Exam Malpractice AI (Invigilo)

Invigilo is an enterprise-grade exam proctoring solution powered by AI. It continuously monitors the exam environment using computer vision to detect suspicious activities, analyze behavior in real-time, and ensure exam integrity. The platform features separate dashboards for Administrators to monitor activities and Students to take exams.

## Key Features

- **Role-Based Access Control**: Separate, secure access for `student` and `admin` roles.
- **Enhanced Authentication**: Email, username, and secure password-based authentication with bcrypt hashing.
- **Facial Verification**: Mandatory face registration for students upon first login to verify identity during exams.
- **Real-Time Proctoring**: 
  - Dynamic risk-scoring system and behavioral pattern tracking.
  - Detects anomalies like missing face, multiple faces, phone/device usage, and unusual gaze patterns.
- **Admin Dashboard**:
  - Live analytics on total active sessions, students, and alerts.
  - Pie charts categorizing violation types (e.g., phone detected, multiple people).
  - Detailed student activity modal to review individual security events and session risk scores.

## Tech Stack

### Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Routing**: React Router DOM
- **UI Components**: Lucide-React (Icons), Recharts (Data Visualization)
- **Utilities**: React Webcam (Camera Feed), React Hot Toast (Notifications)

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Database**: MongoDB (via PyMongo)
- **Computer Vision & AI/ML**: 
  - OpenCV (`cv2`) & NumPy
  - MediaPipe (Face Mesh / Landmark Detection)
  - Ultralytics YOLO (Object Detection, e.g., mobile phones)
  - `face_recognition` (Face Encoding & Matching)
- **Security**: Bcrypt (Password Hashing), Python-Multipart

---

## API Documentation

### Authentication Routes (`/auth`)

#### 1. `POST /auth/signup`
- **Description**: Registers a new user.
- **Payload**: JSON object containing `username`, `email`, `password`, and `role`.

#### 2. `POST /auth/login`
- **Description**: Authenticates a user and returns an access token.
- **Payload**: JSON object containing `username`, `email`, `password`, and `role`.

#### 3. `POST /auth/register-face`
- **Description**: Saves a student's face encoding for verification during exams.
- **Payload**: `multipart/form-data` containing `username` and an image `file`.

### Proctoring & Analysis Routes 

#### 4. `POST /start-session`
- **Description**: Initializes a new proctored exam session.
- **Payload**: JSON object containing `student_id` and `exam_id`.

#### 5. `POST /analyze`
- **Description**: Analyzes a webcam video frame for anomalies such as missing faces, multiple people, or mobile phones.
- **Payload**: `multipart/form-data` containing an image `file` and the `username`.

#### 6. `POST /log-event`
- **Description**: Logs a suspicious activity event into the database.
- **Payload**: JSON object containing `session_id`, `student_id`, `timestamp`, `event_type`, `risk_score`, `details`, and `reasons`.

### Admin Routes (`/admin`)

#### 7. `GET /admin/dashboard-stats`
- **Description**: Aggregates metrics for dashboard chart visualizations (total students, active sessions, alerts).
- **Parameters**: None.

#### 8. `GET /admin/students`
- **Description**: Retrieves a list of all students and their current session statuses.
- **Parameters**: None.

#### 9. `GET /admin/student/{username}/activities`
- **Description**: Fetches the detailed session event logs and anomalies for a specific student.
- **Parameters**: `username` (Path parameter).

---

## Getting Started

### Prerequisites
- Node.js & npm (for the frontend)
- Python 3.9+ & pip (for the backend)
- MongoDB instance (running locally or via Atlas)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd exam-malpractice-ai
   ```

2. **Start the Database:** Ensure MongoDB is running on your machine (default port: `27017`).

3. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

4. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application:** Open `http://localhost:5173` in your browser.
