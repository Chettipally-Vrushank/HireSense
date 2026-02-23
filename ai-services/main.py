from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from dotenv import load_dotenv
load_dotenv()
from pydantic import BaseModel
import PyPDF2
from agents.resume_agent import parse_resume
from fastapi.middleware.cors import CORSMiddleware
from database.mongo import connect_to_mongo, close_mongo_connection
from auth.routes import router as auth_router
from fastapi import Depends
from fastapi.responses import FileResponse
from auth.jwt_handler import get_current_user_id
from database.resume_repository import get_resume_by_id, save_resume, list_resumes
from services.resume_tailor_service import generate_tailored_resume
try:
    from services.pdf_generator_service import generate_pdf_from_resume
except (ImportError, OSError) as e:
    print(f"Warning: PDF generation service unavailable: {e}")
    generate_pdf_from_resume = None

app = FastAPI()

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Option 1 – Resume as raw text
class ResumeTextRequest(BaseModel):
    resume_text: str

@app.post("/ai/parse-resume-text")
def parse_resume_text(data: ResumeTextRequest):
    return parse_resume(data.resume_text)


# 🔹 Option 2 – Resume PDF upload
@app.post("/ai/parse-resume-pdf")
async def parse_resume_pdf(file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)):
    text = ""
    pdf_reader = PyPDF2.PdfReader(file.file)
    for page in pdf_reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted

    parsed_data = parse_resume(text)
    
    # Save to MongoDB
    resume = await save_resume(
        user_id=user_id,
        original_text=text,
        parsed_data=parsed_data,
        skills=parsed_data.get("skills", [])
    )
    
    # Return parsed data + ID
    parsed_data["id"] = resume["_id"]
    return parsed_data


from agents.jd_agent import parse_job_description
from pydantic import BaseModel

class JDRequest(BaseModel):
    jd_text: str

@app.post("/ai/parse-jd")
def parse_jd_api(data: JDRequest):
    return parse_job_description(data.jd_text)



from services.vector_store import upsert_resume_skills

class ResumeSkillsRequest(BaseModel):
    skills: list

@app.post("/ai/store-resume-skills")
def store_resume_skills(data: ResumeSkillsRequest):
    upsert_resume_skills(data.skills)
    return {"status": "Resume skills stored in Pinecone"}


from services.matching_service import compute_match_pinecone

class MatchRequest(BaseModel):
    jd_skills: list

@app.post("/ai/match")
def match_api(data: MatchRequest):
    # Only perform matching. No LLM calls here for speed.
    result = compute_match_pinecone(data.jd_skills)
    return result

from services.gap_service import generate_skill_recommendations

class GapRequest(BaseModel):
    missing_skills: list

@app.post("/ai/gap-analysis")
def gap_analysis(data: GapRequest):
    # This is now called separately (lazy loading)
    recommendations = generate_skill_recommendations(data.missing_skills)
    return recommendations # Returns {"skills": [...]} contract

@app.get("/ai/resumes")
async def get_resumes_api(user_id: str = Depends(get_current_user_id)):
    return await list_resumes(user_id)

# 🔹 AI Tailored Resume Endpoints

class TailorResumeRequest(BaseModel):
    resume_id: str
    job_description: str

@app.post("/ai/tailor-resume")
async def tailor_resume_api(data: TailorResumeRequest, user_id: str = Depends(get_current_user_id)):
    # 1. Fetch resume from MongoDB and verify ownership
    resume = await get_resume_by_id(data.resume_id, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied")
    
    # 2. Call tailoring service
    tailored_data = await generate_tailored_resume(resume["original_text"], data.job_description)
    
    if "error" in tailored_data:
        raise HTTPException(status_code=500, detail=tailored_data["error"])
    
    return tailored_data

class GeneratePDFRequest(BaseModel):
    resume_data: dict

@app.post("/ai/generate-pdf")
async def generate_pdf_api(data: GeneratePDFRequest, user_id: str = Depends(get_current_user_id)):
    # 1. Validate resume data structure (basic check)
    if not data.resume_data or "name" not in data.resume_data:
        raise HTTPException(status_code=400, detail="Invalid resume data")
    
    # 2. Generate PDF
    if generate_pdf_from_resume is None:
        raise HTTPException(
            status_code=503, 
            detail="PDF generation service is currently unavailable on this system (requires GTK+ libraries)."
        )
    
    try:
        pdf_path = generate_pdf_from_resume(data.resume_data)
        return FileResponse(
            pdf_path, 
            media_type="application/pdf", 
            filename=f"Tailored_Resume_{data.resume_data.get('name', 'User')}.pdf"
        )
    except (OSError, ImportError) as e:
        raise HTTPException(
            status_code=503, 
            detail=(
                "PDF generation service is missing system dependencies (GTK+). "
                "Please install GTK+ for Windows: https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows"
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
