from pymongo import MongoClient
import os

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("MONGO_DB", "audio_rag")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

sessions_collection = db.sessions
