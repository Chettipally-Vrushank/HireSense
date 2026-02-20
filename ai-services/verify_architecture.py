import requests
import time
import json

BASE_URL = "http://localhost:8000"

def test_flow():
    print("🚀 Testing Hybrid Fast Architecture...")

    jd_skills = ["Python", "Machine Learning", "FastAPI", "Quantum Computing"]
    
    # 1. Test Match (Should be fast)
    print("\n1️⃣ Testing /ai/match...")
    start = time.time()
    resp = requests.post(f"{BASE_URL}/ai/match", json={"jd_skills": jd_skills})
    duration = time.time() - start
    
    print(f"Match took {duration:.2f}s")
    data = resp.json()
    print(f"Stable Contract Check: {list(data.keys())}")
    
    if "fit_score" in data and "matched_skills" in data and "missing_skills" in data:
        print("✅ Stable Contract Verified for Match")
    else:
        print("❌ Contract Mismatch for Match")
    
    missing = data.get("missing_skills", [])
    
    # 2. Test Gap Analysis (First run - Live)
    if missing:
        print(f"\n2️⃣ Testing /ai/gap-analysis (First run - {len(missing)} skills)...")
        start = time.time()
        resp = requests.post(f"{BASE_URL}/ai/gap-analysis", json={"missing_skills": missing})
        duration = time.time() - start
        print(f"Live Gap Analysis took {duration:.2f}s")
        
        gap_data = resp.json()
        if "skills" in gap_data:
            print(f"✅ Received {len(gap_data['skills'])} recommendations")
        
        # 3. Test Gap Analysis (Second run - Cached)
        print("\n3️⃣ Testing /ai/gap-analysis (Second run - CACHED)...")
        start = time.time()
        resp = requests.post(f"{BASE_URL}/ai/gap-analysis", json={"missing_skills": missing})
        duration = time.time() - start
        print(f"Cached Gap Analysis took {duration:.2f}s")
        
        if duration < 0.1:
            print("⚡ Cache is WORKING!")
        else:
            print("⚠️ Cache might be slow or not hitting.")

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print(f"❌ Test Failed: {e}")
