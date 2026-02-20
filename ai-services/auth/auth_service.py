from passlib.context import CryptContext
from datetime import timedelta
from .jwt_handler import create_access_token
from database.user_repository import get_user_by_email, create_user

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user

async def register_user(email: str, password: str):
    existing_user = await get_user_by_email(email)
    if existing_user:
        return None
    
    hashed_password = hash_password(password)
    user_data = {
        "email": email,
        "hashed_password": hashed_password,
        "is_social": False
    }
    return await create_user(user_data)

async def authenticate_google_user(email: str):
    user = await get_user_by_email(email)
    if not user:
        # Create user if not exists (Social Login)
        user_data = {
            "email": email,
            "hashed_password": None, # No password for social users
            "is_social": True
        }
        user = await create_user(user_data)
    return user
