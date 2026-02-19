import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from services.vector_store import get_all_resume_skills
    print("✅ get_all_resume_skills found")
except ImportError as e:
    print(f"❌ ImportError: {e}")
except Exception as e:
    print(f"❌ Error: {e}")

try:
    from services.matching_service import compute_match_pinecone
    print("✅ matching_service imported successfully")
except Exception as e:
    print(f"❌ matching_service error: {e}")
