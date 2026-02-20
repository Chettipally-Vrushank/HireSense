from services.gemini_service import call_gemini
import json

def generate_skill_recommendations(missing_skills):
    if not missing_skills:
        return {"skills": []} # Return empty list in the new format

    prompt = f"""
    You are an AI career advisor. For each missing skill listed below, generate a personalized learning plan.

    Missing Skills:
    {missing_skills}

    Rules:
    - Keep responses extremely concise.
    - No long paragraphs.
    - No markdown formatting.
    - Return ONLY valid JSON.
    - Exactly 3 short bullet learning steps per skill.
    - Limit each skill response to under 120 words total.

    JSON Output Format:
    {{
      "skills": [
        {{
          "skill_name": "Skill Name",
          "short_importance": "1-2 lines explaining importance",
          "learning_steps": [
            "Step 1",
            "Step 2",
            "Step 3"
          ]
        }}
      ]
    }}
    """

    response = call_gemini(prompt)
    print(f"Gap Analysis Response: {response}")

    try:
        clean = response.strip().strip("```json").strip("```").strip()
        data = json.loads(clean)
        # Handle both the new {"skills": [...]} and the direct [...] for backward compatibility if needed,
        # but the prompt now strictly asks for {"skills": [...]}.
        return data
    except Exception as e:
        print(f"Error parsing recommendations JSON: {e}")
        return {"skills": [{
            "skill_name": "Error",
            "short_importance": "Could not parse recommendations.",
            "learning_steps": ["Check logs", "Retry analysis", "Contact support"]
        }]}
