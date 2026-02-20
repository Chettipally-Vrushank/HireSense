from fastapi import APIRouter, HTTPException, Depends, status
from .models import UserSignup, UserLogin, UserResponse, Token
from .auth_service import register_user, authenticate_user
from .jwt_handler import create_access_token, get_current_user_id
from database.user_repository import get_user_by_id

router = APIRouter(prefix="/auth", tags=["Authentication"])

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
