import json
from services.gemini_service import call_gemini

def parse_job_description(jd_text: str):

    prompt = f"""
    You are a specialized Job Description Parsing AI.
    Your task is to extract a list of technical skills, tools, frameworks, and core professional competencies from the job description.

    STRICT RULES:
    1. Extract ONLY specific technical skills (e.g., "Python", "React", "SQL", "ARIMA").
    2. Do NOT extract locations (e.g., "Hyderabad", "India").
    3. Do NOT extract job types or durations (e.g., "Internship", "6 months").
    4. Do NOT extract organizational headers or boilerplate (e.g., "About the Role", "Responsibilities").
    5. Keep skills granular. For example, use "Python" instead of "Strong Python programming".
    6. Ensure "required_skills" are essential for the role, and "optional_skills" are preferred or nice-to-have.

    Return ONLY valid JSON.

    Required format:
    {{
        "required_skills": ["Skill1", "Skill2"],
        "optional_skills": ["Skill3"]
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

def extract_skills(jd_text: str):
    data = parse_job_description(jd_text)
    if "error" in data:
        return []
    
    # Combine required and optional skills
    skills = data.get("required_skills", []) + data.get("optional_skills", [])
    # Return unique cleaned skills
    return list(set([s.strip() for s in skills if s]))
