from datetime import datetime
from bson import ObjectId
from .mongo import get_database

COLLECTION_NAME = "users"

async def create_user(user_data: dict):
    db = get_database()
    user_data["created_at"] = datetime.utcnow()
    result = await db[COLLECTION_NAME].insert_one(user_data)
    user_data["_id"] = result.inserted_id
    return user_data

async def get_user_by_email(email: str):
    db = get_database()
    user = await db[COLLECTION_NAME].find_one({"email": email})
    return user

async def get_user_by_id(user_id: str):
    db = get_database()
    user = await db[COLLECTION_NAME].find_one({"_id": ObjectId(user_id)})
    return user
