import os
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException, status
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()

def verify_google_token(token: str):
    try:
        if not GOOGLE_CLIENT_ID:
            raise ValueError("GOOGLE_CLIENT_ID missing")
            
        # Specify the CLIENT_ID of the app that accesses the backend:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

        # ID token is valid. Get the user's Google Account ID from the decoded token.
        # userid = idinfo['sub']
        return idinfo
    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
