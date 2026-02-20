import os
import requests
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
BASE_URL = "http://localhost:8001"

def test_expired_token():
    print("Testing Expired Token...")
    
    # Create a token that expired 1 hour ago
    expire = datetime.utcnow() - timedelta(hours=1)
    to_encode = {"user_id": "some_id", "exp": expire}
    expired_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    headers = {"Authorization": f"Bearer {expired_token}"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if resp.status_code == 401:
        print("✅ Expired Token correctly rejected with 401:", resp.json())
    else:
        print(f"❌ Expired Token was NOT rejected (Status {resp.status_code}):", resp.text)

if __name__ == "__main__":
    test_expired_token()
