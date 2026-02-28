"""
Portfolio endpoints — add to main.py via:
    from portfolio_routes import portfolio_router
    app.include_router(portfolio_router)
"""
import re
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
from auth.jwt_handler import get_current_user_id
from database.portfolio_repository import (
    create_or_update_portfolio,
    get_portfolio_by_user_id,
    get_portfolio_by_username,
    check_username_available,
    delete_portfolio
)
from services.portfolio_service import generate_portfolio_html

portfolio_router = APIRouter(tags=["Portfolio"])


# ─── Pydantic models ────────────────────────────────────────────────────────

class ExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    duration: str = ""
    bullets: List[str] = []

class ProjectItem(BaseModel):
    title: str = ""
    description: str = ""

class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""

class PortfolioCreateRequest(BaseModel):
    username: str                           # public slug, e.g. "govindula-abhisht"
    theme: str = "minimal"                  # "minimal" | "modern"
    content_type: str = "profile"           # "profile" | "full"
    # Personal info
    name: str = ""
    email: str = ""
    phone: str = ""
    summary: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""
    # Structured content
    skills: List[str] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    education: List[EducationItem] = []


# ─── Helpers ────────────────────────────────────────────────────────────────

def validate_username(username: str) -> str:
    username = username.strip().lower()
    username = re.sub(r"[^a-z0-9\-]", "-", username)
    username = re.sub(r"-+", "-", username).strip("-")
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(username) > 40:
        raise HTTPException(status_code=400, detail="Username must be 40 characters or fewer")
    return username


# ─── Routes ─────────────────────────────────────────────────────────────────

@portfolio_router.get("/ai/portfolio/check-username")
async def check_username(username: str, user_id: str = Depends(get_current_user_id)):
    """Check if a username slug is available."""
    clean = validate_username(username)
    available = await check_username_available(clean, exclude_user_id=user_id)
    return {"username": clean, "available": available}


@portfolio_router.post("/ai/portfolio")
async def create_portfolio(data: PortfolioCreateRequest, user_id: str = Depends(get_current_user_id)):
    """Create or update the authenticated user's portfolio."""
    clean_username = validate_username(data.username)

    # Check username uniqueness (allow own)
    available = await check_username_available(clean_username, exclude_user_id=user_id)
    existing_own = await get_portfolio_by_user_id(user_id)
    if not available and (not existing_own or existing_own.get("username") != clean_username):
        raise HTTPException(status_code=409, detail="This username is already taken")

    portfolio_doc = {
        "username": clean_username,
        "theme": data.theme,
        "content_type": data.content_type,
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "summary": data.summary,
        "linkedin": data.linkedin,
        "github": data.github,
        "website": data.website,
        "skills": data.skills,
        "experience": [e.dict() for e in data.experience],
        "projects": [p.dict() for p in data.projects],
        "education": [ed.dict() for ed in data.education],
        "public_url": f"hiresense.ai/portfolio/{clean_username}",
    }

    saved = await create_or_update_portfolio(user_id, portfolio_doc)
    return {
        "message": "Portfolio saved successfully",
        "username": clean_username,
        "public_url": f"/portfolio/{clean_username}",
        "portfolio": saved
    }


@portfolio_router.get("/ai/portfolio/me")
async def get_my_portfolio(user_id: str = Depends(get_current_user_id)):
    """Get the authenticated user's own portfolio data."""
    portfolio = await get_portfolio_by_user_id(user_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found. Create one first.")
    return portfolio


@portfolio_router.delete("/ai/portfolio")
async def remove_portfolio(user_id: str = Depends(get_current_user_id)):
    success = await delete_portfolio(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="No portfolio to delete")
    return {"message": "Portfolio deleted"}


# ─── PUBLIC route (no auth) ──────────────────────────────────────────────────

@portfolio_router.get("/portfolio/{username}", response_class=HTMLResponse)
async def view_portfolio(username: str):
    """
    Public portfolio page — renders as a full HTML page.
    Maps to: hiresense.ai/portfolio/{username}
    """
    portfolio = await get_portfolio_by_username(username.lower())
    if not portfolio:
        return HTMLResponse(content=_not_found_page(username), status_code=404)

    html = generate_portfolio_html(portfolio, theme=portfolio.get("theme", "minimal"))
    return HTMLResponse(content=html)


def _not_found_page(username: str) -> str:
    return f"""<!DOCTYPE html>
<html><head><title>Portfolio not found</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400&display=swap" rel="stylesheet"/>
<style>
  body{{background:#080b14;color:#e8ecf4;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}}
  .box{{text-align:center;max-width:400px;padding:2rem;}}
  h1{{font-family:'Syne',sans-serif;font-size:4rem;font-weight:800;color:rgba(255,255,255,.08);margin-bottom:1rem;}}
  p{{color:#6b7694;margin-bottom:2rem;}}
  a{{color:#7c6dfa;text-decoration:none;font-weight:500;}}
</style></head>
<body><div class="box">
  <h1>404</h1>
  <p>No portfolio found for <strong>@{username}</strong>.<br/>The user may not have created one yet.</p>
  <a href="/">← Go to HireSense</a>
</div></body></html>"""