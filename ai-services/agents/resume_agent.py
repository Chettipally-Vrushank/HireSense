import json
from services.gemini_service import call_gemini

# Skills that Gemini commonly hallucinates from networking/deployment-adjacent text.
# If these don't appear VERBATIM in the resume text, they should be excluded.
HALLUCINATION_PRONE = {
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform",
    "ansible", "jenkins", "ci/cd", "helm", "linux", "bash",
}

def parse_resume(resume_text: str):

    prompt = f"""
    You are a Resume Parsing AI.
    Extract the candidate's name, technical skills, project titles, and CGPA.

    STRICT RULES for "skills":
    1. Extract ONLY technical skills, tools, and frameworks.
    2. Include skills mentioned BOTH in the Skills section AND in project descriptions.
    3. Examples of skills to extract: "Java", "AWS", "Machine Learning", "SARIMA", "LightGBM", "Feature Engineering".
    4. Keep skills granular (e.g., "Pandas" instead of "Data manipulation with Pandas").
    5. Extract domain-specific techniques from project descriptions:
       - If a project mentions "SARIMA forecasting models" → extract "SARIMA"
       - If a project mentions "LightGBM vs regression baselines" → extract "LightGBM"
       - If a project mentions "feature engineering" → extract "Feature Engineering"
       - If a project mentions "model benchmarking" or "model evaluation" → extract "Model Evaluation"
       - If a project mentions "time-series forecasting" → extract "Time-series forecasting"
       - If a project mentions "hyperparameter tuning" → extract "Hyperparameter Tuning"
       - If a project mentions "cross-validation" → extract "Cross-validation"
    6. Do NOT include phrases or full sentences.
    7. Do NOT include soft skills, locations, or job types.

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
    resume_text_lower = resume_text.lower()
    
    filtered = []
    for s in skills:
        if not s:
            continue
        s = s.strip()
        s_lower = s.lower()
        # If the skill is hallucination-prone, only keep it if it literally
        # appears in the resume text (case-insensitive)
        if s_lower in HALLUCINATION_PRONE:
            if s_lower not in resume_text_lower:
                print(f"[RESUME AGENT] Filtered hallucinated skill: '{s}'")
                continue
        filtered.append(s)
    
    result = list(set(filtered))
    
    # DEBUG — remove after confirming correct extraction
    print(f"[RESUME AGENT DEBUG] Skills after hallucination filter: {sorted(result)}")
    
    return result