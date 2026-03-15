from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from pydantic import BaseModel
from database.db import users_collection
from database.models import User, UserResponse
from utils.security import get_password_hash, verify_password, create_access_token
from utils.face_encoding import get_face_encoding
import numpy as np
import cv2

router = APIRouter(prefix="/auth", tags=["Auth"])

class UserSignup(BaseModel):
    username: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    username: str
    email: str
    password: str
    role: str

@router.post("/signup")
async def signup(user: UserSignup):
    if user.role not in ["student", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'student' or 'admin'.")
        
    existing_user = users_collection.find_one({"$or": [{"username": user.username}, {"email": user.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
        
    hashed_password = get_password_hash(user.password)
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "role": user.role,
        "face_encoding": None
    }
    
    result = users_collection.insert_one(new_user)
    
    return {"message": "User created successfully", "user_id": str(result.inserted_id)}

@router.post("/login")
async def login(user: UserLogin):
    db_user = users_collection.find_one({"username": user.username, "email": user.email, "role": user.role})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token_data = {"sub": str(db_user["_id"]), "username": db_user["username"], "role": db_user["role"]}
    token = create_access_token(token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user["role"],
        "has_registered_face": db_user.get("face_encoding") is not None
    }

@router.post("/register-face")
async def register_face(username: str = Form(...), file: UploadFile = File(...)):
    db_user = users_collection.find_one({"username": username})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user.get("face_encoding"):
        return {"message": "Face already registered"}
        
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    encoding = get_face_encoding(image)
    if not encoding:
        raise HTTPException(status_code=400, detail="Could not detect a clear face. Please try again.")
        
    users_collection.update_one({"_id": db_user["_id"]}, {"$set": {"face_encoding": encoding}})
    
    return {"message": "Face registered successfully"}
