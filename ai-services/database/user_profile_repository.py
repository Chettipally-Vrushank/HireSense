from datetime import datetime
from bson import ObjectId
from .mongo import get_database

COLLECTION_NAME = "user_profiles"

async def get_profile(user_id: str):
    db = get_database()
    profile = await db[COLLECTION_NAME].find_one({"user_id": user_id})
    if profile:
        profile["_id"] = str(profile["_id"])
    return profile

async def upsert_profile(user_id: str, data: dict) -> dict:
    db = get_database()
    data["user_id"] = user_id
    data["updated_at"] = datetime.utcnow()
    result = await db[COLLECTION_NAME].update_one(
        {"user_id": user_id},
        {"$set": data, "$setOnInsert": {"created_at": datetime.utcnow()}},
        upsert=True
    )
    return await get_profile(user_id)