import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("hiresense-index")

def upsert_resume_skills(skills):
    records = [
        {
            "id": f"resume-skill-{i}",
            "text": skill
        }
        for i, skill in enumerate(skills)
    ]

    index.upsert_records(
        namespace="resume",
        records=records
    )


def query_skill(skill, top_k=1):
    result = index.search(
        namespace="resume",
        query={
            "text": skill,
            "top_k": top_k
        }
    )
    return result
