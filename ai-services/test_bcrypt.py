from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def test_hash():
    password = "securepassword123"
    print(f"Testing password: {password} (len={len(password)})")
    try:
        hashed = pwd_context.hash(password)
        print(f"Hashed: {hashed}")
        verified = pwd_context.verify(password, hashed)
        print(f"Verified: {verified}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_hash()
