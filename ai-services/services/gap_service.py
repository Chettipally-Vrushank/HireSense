import os
import json
from services.gemini_service import call_gemini

CACHE_FILE = "cache/recommendation_cache.json"

def load_cache():
    if not os.path.exists(CACHE_FILE):
        return {}
    try:
        with open(CACHE_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        print(f"⚠️ Warning: Failed to load {CACHE_FILE}. Starting with empty cache.")
        return {}

def save_cache(cache):
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f, indent=2)
    except IOError as e:
        print(f"❌ Error saving cache: {e}")

def normalize_skill(skill):
    return skill.strip().lower()

def generate_skill_recommendations(missing_skills):
    if not missing_skills:
        return {"skills": []}

    cache = load_cache()
    to_generate = []
    recommendations = []

    # 1. Check Cache (Normalized)
    for skill in missing_skills:
        norm_skill = normalize_skill(skill)
        if norm_skill in cache:
            recommendations.append(cache[norm_skill])
        else:
            to_generate.append(skill)

    # 2. Generate for missing ones
    if to_generate:
        # Limit to top 10 for performance
        sample = to_generate[:10]
        
        prompt = f"""
        You are an AI career advisor. For each missing skill listed below, generate a personalized learning plan.

        Missing Skills:
        {sample}

        Rules:
        - Keep responses extremely concise (under 120 words per skill).
        - No long paragraphs or markdown formatting.
        - Return ONLY a valid JSON object with a "skills" array.
        - Exactly 3 short bullet learning steps per skill.

        JSON Format:
        {{
          "skills": [
            {{
              "skill_name": "Skill Name",
              "short_importance": "1-2 lines explaining importance",
              "learning_steps": ["Step 1", "Step 2", "Step 3"]
            }}
          ]
        }}
        """
        
        try:
            response = call_gemini(prompt)
            print(f"Gap Analysis Response (Live): {response[:100]}...") # Log start of response
            
            clean = response.strip().strip("```json").strip("```").strip()
            data = json.loads(clean)
            
            # Update Cache & Results
            if "skills" in data:
                for rec in data["skills"]:
                    norm_name = normalize_skill(rec["skill_name"])
                    cache[norm_name] = rec
                    recommendations.append(rec)
                save_cache(cache)
        except Exception as e:
            print(f"❌ Error generating/parsing recommendations for {to_generate}: {e}")
            # Fallback placeholder for uncached skills to guarantee contract
            for skill in to_generate:
                recommendations.append({
                    "skill_name": skill,
                    "short_importance": "Recommendations currently unavailable.",
                    "learning_steps": ["Research documentation", "Explore online tutorials", "Apply in a small project"]
                })

    return {"skills": recommendations}
