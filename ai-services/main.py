from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import PyPDF2
from agents.resume_agent import parse_resume

app = FastAPI()

# 🔹 Option 1 – Resume as raw text
class ResumeTextRequest(BaseModel):
    resume_text: str

@app.post("/ai/parse-resume-text")
def parse_resume_text(data: ResumeTextRequest):
    return parse_resume(data.resume_text)


# 🔹 Option 2 – Resume PDF upload
@app.post("/ai/parse-resume-pdf")
async def parse_resume_pdf(file: UploadFile = File(...)):
    text = ""

    pdf_reader = PyPDF2.PdfReader(file.file)
    for page in pdf_reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted

    return parse_resume(text)


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
    return compute_match_pinecone(data.jd_skills)

from services.gap_service import generate_skill_recommendations

class GapRequest(BaseModel):
    missing_skills: list

@app.post("/ai/gap-analysis")
def gap_analysis(data: GapRequest):
    recommendations = generate_skill_recommendations(data.missing_skills)
    return {
        "missing_skills": data.missing_skills,
        "recommendations": recommendations
    }
