import json
from services.gemini_service import call_gemini

def parse_resume(resume_text: str):

    prompt = f"""
    You are a Resume Parsing AI.
    Extract the candidate's name, technical skills, project titles, and CGPA.

    STRICT RULES for "skills":
    1. Extract ONLY technical skills, tools, and frameworks (e.g., "Java", "AWS", "Machine Learning").
    2. Keep skills granular (e.g., "Pandas" instead of "Data manipulation with Pandas").
    3. Do NOT include phrases or sentences.

    Return ONLY valid JSON. No explanation.

    Required format:
    {{
        "name": "",
        "skills": ["Skill1", "Skill2"],
        "projects": ["Project Title 1"],
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

def extract_skills(resume_text: str):
    data = parse_resume(resume_text)
    if "error" in data:
        return []
    
    skills = data.get("skills", [])
    return list(set([s.strip() for s in skills if s]))
