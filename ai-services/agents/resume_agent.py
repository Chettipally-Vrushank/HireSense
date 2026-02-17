import json
from services.gemini_service import call_gemini

def parse_resume(resume_text: str):

    prompt = f"""
    You are a resume parsing AI.
    Extract the following details from the resume.
    
    Return ONLY valid JSON. No explanation.

    Required format:
    {{
        "name": "",
        "programming_languages": [],
        "projects": [],
        "cgpa": ""
    }}

    Resume:
    {resume_text}
    """

    raw_response = call_gemini(prompt)

    try:
        cleaned = raw_response.strip("```json").strip("```").strip()
        return json.loads(cleaned)
    except:
        return {
            "error": "Model did not return valid JSON",
            "raw_output": raw_response
        }
