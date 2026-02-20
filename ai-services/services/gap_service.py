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
            
    # Filter out common JD headers that might have been parsed as "skills"
    noise_headers = ["responsibilities:", "preferred skills:", "requirements:", "qualifications:", "about the role:"]
    to_generate = [s for s in to_generate if s.lower() not in noise_headers]
    
    if not to_generate and not recommendations:
        return {"skills": []}

    # 2. Generate for missing ones
    if to_generate:
        sample = to_generate[:8] # Reduce count for reliability
        
        prompt = f"""
        You are a technical career coach. Create a brief learning roadmap for these specific job requirements:
        {sample}

        RETURN ONLY A PURE JSON OBJECT. NO MARKDOWN. NO BACKTICKS.
        JSON structure:
        {{
          "skills": [
            {{
              "skill_name": "Title",
              "importance": "Brief why",
              "roadmap": ["Step 1", "Step 2", "Step 3"]
            }}
          ]
        }}
        
        Rules:
        - roadmap must be an array of exactly 3 strings.
        - Avoid unescaped " quotes inside strings.
        - Ensure the JSON is complete and valid.
        """
        
        try:
            # Reverting is_json=True if the earlier model was 2.5 flash which might not support it
            # Using standard call first
            response = call_gemini(prompt)
            
            # Ultra-robust JSON extraction
            import re
            # Find the first { and the last }
            start = response.find('{')
            end = response.rfind('}')
            
            if start != -1 and end != -1:
                clean = response[start:end+1]
                
                # Pre-processing to fix common LLM JSON errors
                # 1. Remove trailing commas in arrays/objects
                clean = re.sub(r',\s*([\]\}])', r'\1', clean)
                # 2. Try to fix unescaped double quotes in strings (best effort)
                # This is tricky but let's at least handle major ones
            else:
                clean = response.strip()
                
            try:
                data = json.loads(clean)
            except json.JSONDecodeError as e:
                # If it's a truncation error ("Unterminated string"), try to close it
                if "Unterminated string" in str(e):
                    # Append quotes and braces to see if it fixes it
                    data = json.loads(clean + '"]}]}')
                else:
                    raise e
            
            # Update Cache & Results
            if "skills" in data:
                for rec in data["skills"]:
                    # Handle potential key mismatch or variations
                    skill_name = rec.get("skill_name", "Unknown Skill")
                    importance = rec.get("importance", rec.get("short_importance", ""))
                    roadmap = rec.get("roadmap", rec.get("learning_steps", []))
                    
                    final_rec = {
                        "skill_name": skill_name,
                        "importance": importance,
                        "roadmap": roadmap
                    }
                    
                    norm_name = normalize_skill(skill_name)
                    cache[norm_name] = final_rec
                    recommendations.append(final_rec)
                save_cache(cache)
        except Exception as e:
            print(f"❌ Error generating/parsing recommendations for {to_generate}: {e}")
            # Fallback placeholder for uncached skills to guarantee contract
            for skill in to_generate:
                recommendations.append({
                    "skill_name": skill,
                    "importance": "Recommendations currently unavailable.",
                    "roadmap": ["Research documentation", "Explore online tutorials", "Apply in a small project"]
                })

    return {"skills": recommendations}
