from services.gemini_service import call_gemini
import json

def generate_skill_recommendations(missing_skills):
    if not missing_skills:
        return []

    prompt = f"""
    A candidate is missing the following skills:
    {missing_skills}

    For each skill:
    - Explain why it is important in industry
    - Suggest a short learning path (3–5 steps)
    Return clean JSON.
    """

    response = call_gemini(prompt)
    clean = json.loads(response.strip("```json").strip("```"))

    return clean
