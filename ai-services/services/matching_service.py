from services.vector_store import query_skill, get_all_resume_skills

def compute_match_pinecone(jd_skills, threshold=0.7):
    # 0. Fetch all resume skills once (Stable Contract Guarantee)
    resume_skills = get_all_resume_skills()
    print(f"DEBUG: Matching against {len(resume_skills)} resume skills.")

    # Normalize for comparison
    resume_skills_lower = {s.strip().lower() for s in resume_skills}

    matched = []
    missing = []

    for skill in jd_skills:
        skill_clean = skill.strip()
        skill_lower = skill_clean.lower()
        
        is_match = False
        match_type = None

        # --- STEP 1: EXACT MATCH (Normalized) ---
        if skill_lower in resume_skills_lower:
            is_match = True
            match_type = "EXACT"

        # --- STEP 2: SUBSTRING MATCH (Case-insensitive) ---
        if not is_match:
            for r_skill in resume_skills_lower:
                if skill_lower in r_skill or r_skill in skill_lower:
                    is_match = True
                    match_type = "SUBSTRING"
                    break
        
        if is_match:
            print(f"✅ Match Found: '{skill_clean}' ({match_type})")
            matched.append(skill_clean)
            continue

        # --- STEP 3: SEMANTIC FALLBACK (Vector Store) ---
        print(f"🔍 Falling back to semantic search for: '{skill_clean}'")
        try:
            result = query_skill(skill_clean)
            # Handle standard Pinecone query response
            matches = result.get("matches", []) if isinstance(result, dict) else getattr(result, "matches", [])

            if matches:
                top_match = matches[0]
                score = top_match.get("score", 0) if isinstance(top_match, dict) else getattr(top_match, "score", 0)
                metadata = top_match.get("metadata", {}) if isinstance(top_match, dict) else getattr(top_match, "metadata", {})
                stored_text = metadata.get("text", "")

                if score >= threshold:
                    print(f"🧬 Semantic Match: '{skill_clean}' (Score: {score:.2f} vs Stored: '{stored_text}')")
                    matched.append(skill_clean)
                    is_match = True
        except Exception as e:
            print(f"❌ Error during semantic fallback for {skill_clean}: {e}")
        
        if not is_match:
            print(f"❌ No Match: '{skill_clean}'")
            missing.append(skill_clean)

    # 4. Fit Score Calculation
    fit_score = (len(matched) / len(jd_skills)) * 100 if jd_skills else 0

    # Stable Response Contract
    return {
        "fit_score": round(fit_score, 2),
        "matched_skills": matched,
        "missing_skills": missing
    }
