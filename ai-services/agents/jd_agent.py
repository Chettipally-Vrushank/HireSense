import json
from services.gemini_service import call_gemini

def parse_job_description(jd_text: str):

    prompt = f"""
    You are a job description parsing AI.

    Extract the following details.
    Return ONLY valid JSON.

    Required format:
    {{
        "required_skills": [],
        "optional_skills": []
    }}

    Job Description:
    {jd_text}
    """

    raw_response = call_gemini(prompt)

    try:
        cleaned = raw_response.strip("```json").strip("```").strip()
        return json.loads(cleaned)
    except:
        return {
            "error": "Invalid JSON",
            "raw_output": raw_response
        }
