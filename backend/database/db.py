from pymongo import MongoClient
from core.config import MONGO_URI, DATABASE_NAME

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

sessions_collection = db["sessions"]
events_collection = db["events"]
users_collection = db["users"]
questions_collection = db["questions"]
