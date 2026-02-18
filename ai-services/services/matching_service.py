from services.vector_store import query_skill

def compute_match_pinecone(jd_skills, threshold=0.25):

    matched = []
    missing = []

    for skill in jd_skills:
        result = query_skill(skill)

        hits = result.get("result", {}).get("hits", [])

        if hits:
            score = hits[0].get("_score", 0)
            stored_text = hits[0]["fields"]["text"]

            print(f"Skill: {skill}, Score: {score}, Stored: {stored_text}")

            # 🔥 HYBRID MATCHING
            if skill.lower() in stored_text.lower() or stored_text.lower() in skill.lower():
                matched.append(skill)

            elif score >= threshold:
                matched.append(skill)

            else:
                missing.append(skill)
        else:
            missing.append(skill)


    fit_score = (len(matched) / len(jd_skills)) * 100 if jd_skills else 0

    return {
        "fit_score": round(fit_score, 2),
        "matched_skills": matched,
        "missing_skills": missing
    }
