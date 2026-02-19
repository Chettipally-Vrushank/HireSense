import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

from pinecone import Pinecone, ServerlessSpec
import time

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
INDEX_NAME = "hiresense-index"

def ensure_index():
    # Check if index exists
    existing_indexes = [i.name for i in pc.list_indexes()]
    
    if INDEX_NAME in existing_indexes:
        try:
            desc = pc.describe_index(INDEX_NAME)
            if desc.dimension != 768:
                print(f"⚠️ Index dimension mismatch (Exists: {desc.dimension}, Needed: 768). Recreating index...")
                pc.delete_index(INDEX_NAME)
                time.sleep(5) # Wait for deletion
            else:
                return pc.Index(INDEX_NAME)
        except Exception as e:
            print(f"Error checking index: {e}")
            # Fallthrough to create if checking failed but we want to try creating
            
    if INDEX_NAME not in [i.name for i in pc.list_indexes()]:
        print(f"Creating index {INDEX_NAME} with dimension 768...")
        try:
            pc.create_index(
                name=INDEX_NAME,
                dimension=768,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            time.sleep(5) # Wait for creation
        except Exception as e:
            print(f"Failed to create index: {e}")
            raise e

    return pc.Index(INDEX_NAME)

index = ensure_index()


from services.gemini_service import get_embedding

def clear_resume_skills():
    try:
        index.delete(delete_all=True, namespace="resume")
    except Exception as e:
        # Ignore 404 if namespace doesn't exist yet
        print(f"Note: clearing resume skills failed (likely first run): {e}")

def upsert_resume_skills(skills):
    clear_resume_skills()
    vectors = []
    
    # Batch embedding generation
    try:
        embeddings = get_embedding(skills)
    except Exception as e:
        print(f"Error generating batch embeddings: {e}")
        return

    for i, skill in enumerate(skills):
        if i < len(embeddings) and embeddings[i]: # Ensure embedding exists
            vectors.append({
                "id": f"resume-skill-{i}",
                "values": embeddings[i],
                "metadata": {"text": skill}
            })
        else:
             print(f"Skipping skill {skill} due to missing embedding")

    if vectors:
        index.upsert(
            vectors=vectors,
            namespace="resume"
        )


def query_skill(skill, top_k=1):
    try:
        embedding = get_embedding(skill)
        result = index.query(
            namespace="resume",
            vector=embedding,
            top_k=top_k,
            include_metadata=True
        )
        return result
    except Exception as e:
        print(f"Error querying skill {skill}: {e}")
        return {"matches": []}


def get_all_resume_skills():
    # Fetch up to 100 skills (assuming reasonable resume size)
    ids = [f"resume-skill-{i}" for i in range(100)]
    try:
        result = index.fetch(ids=ids, namespace="resume")
    except Exception as e:
        print(f"Error fetching skills: {e}")
        return []

    skills = []
    # result.vectors is a dict
    vectors = result.vectors if isinstance(result.vectors, dict) else getattr(result, "vectors", {})
    
    for key, value in vectors.items():
        # Access metadata safely
        metadata = getattr(value, "metadata", {})
        if not metadata and isinstance(value, dict):
             metadata = value.get("metadata", {})
        
        if metadata and "text" in metadata:
             skills.append(metadata["text"])
    
    return skills
