import os
import sys
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

try:
    api_key = os.getenv("PINECONE_API_KEY")
    if not api_key:
        print("PINECONE_API_KEY not found")
        sys.exit(1)

    pc = Pinecone(api_key=api_key)
    index = pc.Index("hiresense-index")

    print(f"Index object type: {type(index)}")
    print(f"Available methods: {dir(index)}")

    if hasattr(index, 'upsert_records'):
        print("✅ upsert_records exists")
    else:
        print("❌ upsert_records does NOT exist")
    
    if hasattr(index, 'search'):
        print("✅ search exists")
    else:
        print("❌ search does NOT exist")

except Exception as e:
    print(f"Error: {e}")
