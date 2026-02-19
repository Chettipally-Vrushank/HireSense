from services.gemini_service import call_gemini
import json

def generate_skill_recommendations(missing_skills):
    if not missing_skills:
        return []

    prompt = f"""
    A candidate is missing the following skills:
    {missing_skills}

    For each skill:
    - "skill": The name of the missing skill
    - "importance": Explain why it is important in industry (1 sentence)
    - "learning_path": A list of 3–5 short steps to learn it

    Return ONLY a valid JSON list of objects. Do not wrap in markdown code blocks if possible, or I will strip them.
    Example:
    [
        {{ "skill": "Python", "importance": "...", "learning_path": ["Step 1", "Step 2"] }}
    ]
    """

    response = call_gemini(prompt)
    print(f"Gap Analysis Response: {response}") # Debug logging

    try:
        clean = response.strip().strip("```json").strip("```").strip()
        return json.loads(clean)
    except Exception as e:
        print(f"Error parsing recommendations JSON: {e}")
        # Return a fallback or the raw text if parsing fails? 
        # Better to return empty list or Try to repair?
        # Let's return a simple object wrapping the text if it fails, so frontend sees *something*
        return [{
            "skill": "Recommendations (Raw)", 
            "importance": "Could not parse structured recommendations.", 
            "learning_path": [response]
        }]
