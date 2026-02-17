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
