from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from datetime import datetime
from typing import List, Dict, Optional

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.hiresense

tailored_resumes_collection = db.tailored_resumes

async def save_tailored_resume(user_id: str, resume_data: Dict, original_resume_id: Optional[str] = None) -> Dict:
    tailored_resume = {
        "user_id": user_id,
        "resume_data": resume_data,
        "original_resume_id": original_resume_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await tailored_resumes_collection.insert_one(tailored_resume)
    tailored_resume["_id"] = str(result.inserted_id)
    return tailored_resume

async def get_tailored_resume(resume_id: str, user_id: str) -> Optional[Dict]:
    resume = await tailored_resumes_collection.find_one({
        "_id": ObjectId(resume_id),
        "user_id": user_id
    })
    if resume:
        resume["_id"] = str(resume["_id"])
    return resume

async def list_tailored_resumes(user_id: str) -> List[Dict]:
    cursor = tailored_resumes_collection.find({"user_id": user_id}).sort("updated_at", -1)
    resumes = await cursor.to_list(length=100)
    for resume in resumes:
        resume["_id"] = str(resume["_id"])
    return resumes

async def update_tailored_resume(resume_id: str, user_id: str, resume_data: Dict) -> bool:
    result = await tailored_resumes_collection.update_one(
        {"_id": ObjectId(resume_id), "user_id": user_id},
        {"$set": {"resume_data": resume_data, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0

async def delete_tailored_resume(resume_id: str, user_id: str) -> bool:
    result = await tailored_resumes_collection.delete_one({
        "_id": ObjectId(resume_id),
        "user_id": user_id
    })
    return result.deleted_count > 0
