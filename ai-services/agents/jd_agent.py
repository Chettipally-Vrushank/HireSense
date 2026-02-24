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
    6. IMPORTANT: If a skill is written as "X/Y" (e.g., "ARIMA/SARIMA", "SQL/SQLite", "Power BI/Excel"), 
       split them into SEPARATE skills: ["ARIMA", "SARIMA"] not ["ARIMA/SARIMA"].
    7. Ensure "required_skills" are essential for the role, and "optional_skills" are preferred or nice-to-have.
    8. Extract technique names from responsibilities too:
       - "Build time-series forecasting models" → "Time-series forecasting"
       - "Perform feature engineering and model evaluation" → "Feature Engineering", "Model Evaluation"
       - "CI/CD pipeline management" → "CI/CD"

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
    
    # Known acronyms that contain "/" and must NOT be split
    NO_SPLIT = {"ci/cd", "tcp/ip", "i/o", "r&d", "b2b", "b2c", "ml/ai", "ai/ml"}

    # Post-process: split "X/Y" compound skills (e.g. "ARIMA/SARIMA" → ["ARIMA","SARIMA"])
    # but only when BOTH parts are meaningful (len > 2) and the skill isn't a known acronym
    split_skills = []
    for skill in skills:
        skill_lower = skill.strip().lower()
        if "/" in skill and skill_lower not in NO_SPLIT:
            parts = [p.strip() for p in skill.split("/")]
            # Only split if every part is a real word (length > 2), not single letters/abbreviations
            if all(len(p) > 2 for p in parts):
                split_skills.extend(parts)
            else:
                # Keep as-is (e.g. "CI/CD" has parts "CI" and "CD", both ≤ 2 chars... 
                # but CI=2, CD=2 so this catches it)
                split_skills.append(skill)
        else:
            split_skills.append(skill)
    
    # Return unique cleaned skills
    return list(set([s.strip() for s in split_skills if s]))