from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from datetime import datetime
from typing import Optional, Dict

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.hiresense

portfolios_collection = db.portfolios


async def create_or_update_portfolio(user_id: str, portfolio_data: Dict) -> Dict:
    existing = await portfolios_collection.find_one({"user_id": user_id})
    now = datetime.utcnow()

    if existing:
        await portfolios_collection.update_one(
            {"user_id": user_id},
            {"$set": {**portfolio_data, "updated_at": now}}
        )
        updated = await portfolios_collection.find_one({"user_id": user_id})
        updated["_id"] = str(updated["_id"])
        return updated
    else:
        doc = {
            "user_id": user_id,
            **portfolio_data,
            "created_at": now,
            "updated_at": now,
            "views": 0
        }
        result = await portfolios_collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc


async def get_portfolio_by_user_id(user_id: str) -> Optional[Dict]:
    doc = await portfolios_collection.find_one({"user_id": user_id})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


async def get_portfolio_by_username(username: str) -> Optional[Dict]:
    doc = await portfolios_collection.find_one({"username": username})
    if doc:
        doc["_id"] = str(doc["_id"])
        await portfolios_collection.update_one(
            {"username": username},
            {"$inc": {"views": 1}}
        )
    return doc


async def check_username_available(username: str, exclude_user_id: str = None) -> bool:
    query = {"username": username}
    if exclude_user_id:
        query["user_id"] = {"$ne": exclude_user_id}
    existing = await portfolios_collection.find_one(query)
    return existing is None


async def delete_portfolio(user_id: str) -> bool:
    result = await portfolios_collection.delete_one({"user_id": user_id})
    return result.deleted_count > 0