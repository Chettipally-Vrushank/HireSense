import requests
import time

BASE_URL = "http://localhost:8001"
TEST_USER = {
    "email": "test@example.com",
    "password": "securepassword123"
}

def test_auth_flow():
    print("🚀 Starting Auth Flow Verification...")

    # 1. Test Signup
    print("\n1️⃣ Testing /auth/signup...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/signup", json=TEST_USER)
        if resp.status_code == 200:
            print("✅ Signup Successful")
        elif resp.status_code == 400:
            print("⚠️ Signup Failed (Duplicate?):", resp.json())
        else:
            print(f"❌ Signup Error {resp.status_code}:", resp.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return

    # 2. Test Duplicate Signup (Expected Failure)
    print("\n2️⃣ Testing Duplicate Signup (Should Fail)...")
    resp = requests.post(f"{BASE_URL}/auth/signup", json=TEST_USER)
    if resp.status_code == 400:
        print("✅ Duplicate Signup Failed as expected:", resp.json())
    else:
        print(f"❌ Expected failure but got {resp.status_code}:", resp.text)

    # 3. Test Invalid Password Login
    print("\n3️⃣ Testing Invalid Password Login...")
    invalid_login = TEST_USER.copy()
    invalid_login["password"] = "wrongpassword"
    resp = requests.post(f"{BASE_URL}/auth/login", json=invalid_login)
    if resp.status_code == 401:
        print("✅ Invalid Login Failed as expected:", resp.json())
    else:
        print(f"❌ Expected failure but got {resp.status_code}:", resp.text)

    # 4. Test Login
    print("\n4️⃣ Testing /auth/login...")
    resp = requests.post(f"{BASE_URL}/auth/login", json=TEST_USER)
    if resp.status_code == 200:
        token_data = resp.json()
        token = token_data["access_token"]
        print("✅ Login Successful. Token received.")
    else:
        print(f"❌ Login Failed {resp.status_code}:", resp.text)
        return

    # 5. Test Protected Route (/auth/me)
    print("\n5️⃣ Testing /auth/me (Protected Route)...")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if resp.status_code == 200:
        print("✅ Access Protected Route Successful:", resp.json())
    else:
        print(f"❌ Access Error {resp.status_code}:", resp.text)

    # 6. Test Expired Token (Simulate by decoding and inspecting or just knowing logic)
    # We can't easily "manually adjust exp" without re-signing or waiting.
    # But we can test an invalid token.
    print("\n6️⃣ Testing Invalid Token...")
    headers = {"Authorization": "Bearer invalid_token"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if resp.status_code == 401:
        print("✅ Invalid Token handling works.")
    else:
        print(f"❌ Token validation failed to catch invalid token.")

if __name__ == "__main__":
    test_auth_flow()
