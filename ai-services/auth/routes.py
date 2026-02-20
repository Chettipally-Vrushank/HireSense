from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from .models import UserSignup, UserLogin, UserResponse, Token, GoogleLoginRequest
from .auth_service import register_user, authenticate_user, authenticate_google_user
from .jwt_handler import create_access_token, get_current_user_id
from .google_auth import verify_google_token
from database.user_repository import get_user_by_id
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
# This should match your Google Console Redirect URI
REDIRECT_URI = "http://localhost:8000/auth/google/callback"

@router.get("/google/login")
async def google_login_redirect():
    # Construct Google OAuth URL
    scope = "openid email profile"
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline"
    )
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str):
    import requests
    token_url = "https://oauth2.googleapis.com/token"
    
    if not GOOGLE_CLIENT_SECRET:
        print("ERROR: GOOGLE_CLIENT_SECRET is missing from environment")
        raise HTTPException(status_code=500, detail="Backend configuration error: client_secret missing")

    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    
    r = requests.post(token_url, data=data)
    tokens = r.json()
    
    if "error" in tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Google OAuth Error: {tokens.get('error_description', tokens.get('error'))}"
        )
        
    id_token = tokens.get("id_token")
    if not id_token:
        raise HTTPException(status_code=401, detail="No ID token returned from Google")
    
    # Now verify and login
    idinfo = verify_google_token(id_token)
    user = await authenticate_google_user(idinfo["email"])
    access_token = create_access_token(data={"user_id": str(user["_id"])})
    
    # Redirect back to frontend dashboard with token
    return RedirectResponse(f"http://localhost:3000/login?token={access_token}")

@router.post("/google", response_model=Token)
async def google_login(data: GoogleLoginRequest):
    # 1. Verify Google Token
    idinfo = verify_google_token(data.token)
    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")

    # 2. Authenticate/Register User
    user = await authenticate_google_user(email)
    
    # 3. Generate JWT
    access_token = create_access_token(data={"user_id": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserSignup):
    user = await register_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "created_at": user["created_at"]
    }

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={"user_id": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user_id)):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "created_at": user["created_at"]
    }
