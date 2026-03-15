from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import session_routes, analysis_routes, report_routes, auth_routes, admin_routes

app = FastAPI(title="Smart Exam Malpractice Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session_routes.router)
app.include_router(analysis_routes.router)
app.include_router(report_routes.router)
app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
