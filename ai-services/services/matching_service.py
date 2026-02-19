from services.vector_store import query_skill, get_all_resume_skills

def compute_match_pinecone(jd_skills, threshold=0.7):
    # Fetch all resume skills once to avoid N queries
    resume_skills = get_all_resume_skills()
    print(f"Resume Skills from DB: {resume_skills}")

    # Normalize for comparison
    resume_skills_lower = {s.lower() for s in resume_skills}

    matched = []
    missing = []

    for skill in jd_skills:
        skill_lower = skill.lower()
        
        # 1. Exact / Fuzzy Match (In-Memory)
        # Check if the skill is directly in the resume skills
        # Or if the skill is a substring of a resume skill (e.g. "React" in "React.js")
        # Or if a resume skill is a substring of the requested skill (e.g. "AWS" in "AWS Cloud")
        
        is_match = False
        if skill_lower in resume_skills_lower:
            is_match = True
        else:
            # Substring matching
            for r_skill in resume_skills_lower:
                if skill_lower in r_skill or r_skill in skill_lower:
                    is_match = True
                    break
        
        if is_match:
            matched.append(skill)
            continue

        # 2. Semantic Match (Vector Store) - ONLY if not found by text
        print(f"Checking vector store for: {skill}")
        result = query_skill(skill)
        
        # Handle standard Pinecone query response
        matches = result.get("matches", []) if isinstance(result, dict) else getattr(result, "matches", [])

        found_in_vector = False
        if matches:
            top_match = matches[0]
            score = top_match.get("score", 0) if isinstance(top_match, dict) else getattr(top_match, "score", 0)
            metadata = top_match.get("metadata", {}) if isinstance(top_match, dict) else getattr(top_match, "metadata", {})
            stored_text = metadata.get("text", "")

            print(f"Skill: {skill}, Score: {score}, Stored: {stored_text}")

            if score >= threshold:
                matched.append(skill)
                found_in_vector = True
        
        if not found_in_vector:
            missing.append(skill)


    fit_score = (len(matched) / len(jd_skills)) * 100 if jd_skills else 0

    return {
        "fit_score": round(fit_score, 2),
        "matched_skills": matched,
        "missing_skills": missing
    }
