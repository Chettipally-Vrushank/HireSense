import numpy as np
from agents.jd_agent import extract_skills as extract_jd_skills
from agents.resume_agent import extract_skills as extract_resume_skills
from services.gemini_service import get_embedding

BLACKLIST = ["india", "hyderabad", "intern", "internship", "role", "location"]

PHRASE_MAPPING = {
    "strong python programming": "python",
    "python programming": "python",
    "time series forecasting models": "time-series forecasting",
    "time series forecasting": "time-series forecasting",
    "time-series forecasting models": "time-series forecasting",
    "data visualization using power bi": "power bi",
    "knowledge of sql": "sql",
    # Mappings added for better semantic matching
    "arima": "time-series forecasting",
    "sarima": "time-series forecasting",
    "lightgbm": "gradient boosting",
    "xgboost": "gradient boosting",
    "catboost": "gradient boosting",
    "gbm": "gradient boosting",
    "reactjs": "react",
    "nodejs": "node.js",
    "node": "node.js",
    "expressjs": "express.js",
    "express": "express.js",
    "mongo": "mongodb",
    "rest apis": "api",
    "apis": "api",
    "rest api": "api",
    "git version control": "git",
    "github": "git",
    "docker": "containerization",
    "kubernetes": "container orchestration",
    "model benchmarking": "model evaluation",
}

def normalize_skills(skills):
    normalized = []
    for skill in skills:
        s = skill.strip().lower()
        if s in BLACKLIST:
            continue
        # Apply phrase mapping
        s = PHRASE_MAPPING.get(s, s)
        normalized.append(s)
    return list(set(normalized))

def cosine_similarity(v1, v2):
    if v1 is None or v2 is None or len(v1) == 0 or len(v2) == 0:
        return 0
    v1 = np.array(v1)
    v2 = np.array(v2)
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0
    return dot_product / (norm_v1 * norm_v2)

def compute_match(jd_skills, resume_skills, threshold=0.7):
    if not jd_skills:
        return {"fit_score": 0.0, "matched_skills": [], "missing_skills": []}

    # Batch embed everything for efficiency
    resume_embeddings_list = get_embedding(resume_skills) if resume_skills else []
    resume_embs = {s: e for s, e in zip(resume_skills, resume_embeddings_list)}
    
    jd_embeddings_list = get_embedding(jd_skills)
    jd_embs = {s: e for s, e in zip(jd_skills, jd_embeddings_list)}
    
    all_keywords = []
    jd_to_kws = {}
    for skill in jd_skills:
        if " " in skill:
            kws = [k.strip() for k in skill.split() if len(k.strip()) > 2]
            jd_to_kws[skill] = kws
            all_keywords.extend(kws)
    
    unique_keywords = list(set(all_keywords))
    kw_embeddings_list = get_embedding(unique_keywords) if unique_keywords else []
    kw_embs = {k: e for k, e in zip(unique_keywords, kw_embeddings_list)}

    matched = []
    missing = []
    total_score = 0
    
    for jd_skill in jd_skills:
        jd_skill_lower = jd_skill.lower()
        score = 0
        match_type = None
        
        # STEP 1: Exact Match
        if any(jd_skill_lower == rs.lower() for rs in resume_skills):
            score = 1.0
            match_type = "EXACT"
        
        # STEP 2: Substring Match
        if match_type is None:
            for rs in resume_skills:
                rs_lower = rs.lower()
                if jd_skill_lower in rs_lower or rs_lower in jd_skill_lower:
                    score = 1.0
                    match_type = "SUBSTRING"
                    break
        
        # STEP 3: Semantic Match
        if match_type is None:
            jd_emb = jd_embs.get(jd_skill)
            max_sim = 0
            for rs, rs_emb in resume_embs.items():
                sim = cosine_similarity(jd_emb, rs_emb)
                if sim > max_sim:
                    max_sim = sim
            
            if max_sim >= threshold:
                score = max_sim if max_sim >= 0.75 else max_sim # Scoring rule: Strong semantic >= 0.75 -> similarity score
                match_type = "SEMANTIC"
        
        # STEP 4: Keyword Fallback (Disabled to reduce false positives)
        # if match_type is None and jd_skill in jd_to_kws:
        #     kws = jd_to_kws[jd_skill]
        #     max_kw_sim = 0
        #     for kw in kws:
        #         kw_emb = kw_embs.get(kw)
        #         for rs, rs_emb in resume_embs.items():
        #             sim = cosine_similarity(kw_emb, rs_emb)
        #             if sim > max_kw_sim:
        #                 max_kw_sim = sim
        #
        #     if max_kw_sim >= (threshold + 0.05):
        #         score = 0.6
        #         match_type = "KEYWORD"
        
        if match_type:
            matched.append(jd_skill)
            total_score += score
        else:
            missing.append(jd_skill)
            
    fit_score = (total_score / len(jd_skills)) * 100
    
    return {
        "fit_score": round(float(fit_score), 2),
        "matched_skills": matched,
        "missing_skills": missing
    }

def run_matching_pipeline(jd_text: str, resume_text: str):
    # 1. Extract
    jd_raw = extract_jd_skills(jd_text)
    res_raw = extract_resume_skills(resume_text)
    
    # 2. Normalize
    jd_skills = normalize_skills(jd_raw)
    res_skills = normalize_skills(res_raw)
    
    # 3. Match
    return compute_match(jd_skills, res_skills)
