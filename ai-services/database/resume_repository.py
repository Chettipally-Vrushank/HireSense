from datetime import datetime
from bson import ObjectId
from .mongo import get_database

COLLECTION_NAME = "resumes"

async def save_resume(user_id: str, original_text: str, parsed_data: dict, skills: list):
    db = get_database()
    resume_data = {
        "user_id": user_id,
        "original_text": original_text,
        "parsed_data": parsed_data,
        "extracted_skills": skills,
        "uploaded_at": datetime.utcnow()
    }
    result = await db[COLLECTION_NAME].insert_one(resume_data)
    resume_data["_id"] = str(result.inserted_id)
    return resume_data

async def get_resume_by_id(resume_id: str, user_id: str):
    db = get_database()
    resume = await db[COLLECTION_NAME].find_one({
        "_id": ObjectId(resume_id),
        "user_id": user_id
    })
    if resume:
        resume["_id"] = str(resume["_id"])
    return resume

async def list_resumes(user_id: str):
    db = get_database()
    cursor = db[COLLECTION_NAME].find({"user_id": user_id}).sort("uploaded_at", -1)
    resumes = await cursor.to_list(length=100)
    for r in resumes:
        r["_id"] = str(r["_id"])
    return resumes
