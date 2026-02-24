import numpy as np
from agents.jd_agent import extract_skills as extract_jd_skills
from agents.resume_agent import extract_skills as extract_resume_skills
from services.gemini_service import get_embedding

BLACKLIST = {
    # Locations / demographics
    "india", "hyderabad", "intern", "internship", "role", "location",
    # CI/CD fragments that result from bad splits
    "ci", "cd",
    # Generic filler words that sometimes get extracted as skills
    "and", "with", "using", "the", "of", "for",
}

PHRASE_MAPPING = {
    # Python variants
    "strong python programming": "python",
    "python programming": "python",
    # Time series variants
    "time series forecasting models": "time-series forecasting",
    "time series forecasting": "time-series forecasting",
    "time-series forecasting models": "time-series forecasting",
    # Power BI
    "data visualization using power bi": "power bi",
    "powerbi": "power bi",
    # SQL variants
    "knowledge of sql": "sql",
    # REST API variants
    "rest apis": "rest apis",
    "rest api": "rest apis",
    "apis": "rest apis",
    # Model evaluation synonyms
    "model benchmarking": "model evaluation",
    # CI/CD variants — always normalize to "ci/cd"
    "ci/cd pipeline": "ci/cd",
    "ci/cd pipeline management": "ci/cd",
    "cicd": "ci/cd",
    # Cloud deployment → treat as cloud/aws skill
    "cloud deployment on aws": "aws",
    "cloud deployment": "cloud",
    # Gradient boosting
    "gradient boosting models": "gradient boosting",
}

# Skills that are domain-isolated: they should NEVER match outside their cluster
# even if embeddings say they're similar (e.g. Docker ≠ Flask, Kubernetes ≠ NodeJS)
DOMAIN_ISOLATED_SKILLS = {
    # Container / DevOps cluster — only match each other
    "docker":       {"docker", "kubernetes", "ci/cd", "jenkins", "terraform", "ansible", "helm"},
    "kubernetes":   {"docker", "kubernetes", "ci/cd", "helm", "terraform"},
    "ci/cd":        {"docker", "kubernetes", "jenkins", "ci/cd", "github actions"},
    "jenkins":      {"ci/cd", "jenkins", "docker", "kubernetes"},
    # Cloud cluster — only match each other, never match web frameworks
    "aws":          {"aws", "azure", "gcp", "cloud", "ec2", "s3", "lambda"},
    "azure":        {"aws", "azure", "gcp", "cloud"},
    "gcp":          {"aws", "azure", "gcp", "cloud"},
    "cloud":        {"aws", "azure", "gcp", "cloud", "ec2", "s3", "lambda"},
    # Database cluster — SQL can match SQLite but not NoSQL
    "mongodb":      {"mongodb", "nosql", "dynamodb", "cassandra", "redis"},
    "redis":        {"redis", "mongodb", "nosql", "memcached"},
}

def is_domain_isolated_mismatch(jd_skill: str, rs_skill: str) -> bool:
    """
    Returns True if the JD skill is domain-isolated and the resume skill
    is NOT in its allowed cluster. This blocks cross-domain false positives.
    """
    jd_lower = jd_skill.lower()
    rs_lower = rs_skill.lower()
    if jd_lower in DOMAIN_ISOLATED_SKILLS:
        allowed = DOMAIN_ISOLATED_SKILLS[jd_lower]
        if rs_lower not in allowed:
            return True  # Block this match
    return False

# Domain knowledge aliases:
# If resume has KEY skill, it semantically satisfies any of the VALUE skills in the JD
SKILL_ALIASES = {
    # Time-series — resume skills that satisfy time-series JD phrases
    "sarima":                   ["arima", "time-series forecasting", "statistical modeling",
                                 "time series predictive modeling", "time series modeling",
                                 "predictive modeling", "forecasting"],
    "arima":                    ["sarima", "time-series forecasting", "statistical modeling",
                                 "time series predictive modeling", "forecasting"],
    "time-series forecasting":  ["sarima", "arima", "statistical modeling",
                                 "time series predictive modeling", "forecasting"],
    # Gradient boosting family
    "lightgbm":                 ["gradient boosting", "gradient boosting models", "xgboost",
                                 "boosting", "ensemble methods"],
    "xgboost":                  ["gradient boosting", "gradient boosting models", "lightgbm",
                                 "boosting", "ensemble methods"],
    "gradient boosting":        ["lightgbm", "xgboost"],
    # BI / Dashboards — PowerBI satisfies business intelligence dashboard JD phrases
    "power bi":                 ["business intelligence", "bi dashboards",
                                 "business intelligence dashboards", "dashboards",
                                 "data visualization", "reporting"],
    "powerbi":                  ["business intelligence", "bi dashboards",
                                 "business intelligence dashboards", "dashboards",
                                 "data visualization", "reporting"],
    "excel":                    ["spreadsheets", "data analysis", "reporting"],
    # SQL variants
    "sql":                      ["structured query language", "relational database",
                                 "database querying", "rdbms"],
    "sqlite":                   ["sql", "structured query language", "relational database"],
    # Model evaluation
    "model evaluation":         ["model benchmarking", "model evaluation"],
    "model benchmarking":       ["model evaluation"],
    # Feature engineering
    "feature engineering":      ["feature engineering", "feature extraction", "feature selection"],
    # APIs
    "rest apis":                ["api development", "restful services", "web services", "apis"],
}

def normalize_skills(skills):
    normalized = []
    for skill in skills:
        s = skill.strip().lower()
        if s in BLACKLIST:
            continue
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

def alias_match(jd_skill, resume_skills):
    """
    Check if any resume skill is a known domain alias for the JD skill.
    
    Two directions:
    1. Resume skill has an alias list that includes the JD skill
       e.g. resume="power bi", aliases=["business intelligence dashboards"] → JD="business intelligence dashboards" ✅
    2. JD skill has an alias list that includes the resume skill  
       e.g. jd="time-series forecasting", aliases=["sarima"] → resume="sarima" ✅
    3. Partial JD phrase match: any alias of a resume skill is CONTAINED IN the JD phrase
       e.g. resume="power bi", alias="business intelligence" → jd="business intelligence dashboards" ✅
    """
    jd_lower = jd_skill.lower()
    for rs in resume_skills:
        rs_lower = rs.lower()
        rs_aliases = SKILL_ALIASES.get(rs_lower, [])
        jd_aliases = SKILL_ALIASES.get(jd_lower, [])
        # Direction 1: resume skill aliases contain exact JD skill
        if jd_lower in rs_aliases:
            return True
        # Direction 2: JD skill aliases contain exact resume skill
        if rs_lower in jd_aliases:
            return True
        # Direction 3: any alias of the resume skill appears as substring in JD phrase
        # (handles "business intelligence" matching "business intelligence dashboards")
        for alias in rs_aliases:
            if len(alias) >= 5 and alias in jd_lower:
                return True
    return False

def compute_match(jd_skills, resume_skills, threshold=0.78):
    """
    Multi-stage skill matching pipeline.

    Threshold is set at 0.78 (higher than before) to avoid false positives
    like Docker matching Flask/NodeJS in DevOps vs Web Dev comparisons.

    Alias matching handles the true semantic synonyms explicitly so we
    don't need to lower the threshold for those cases.
    """
    if not jd_skills:
        return {"fit_score": 0.0, "matched_skills": [], "missing_skills": []}

    # Batch embed everything
    resume_embeddings_list = get_embedding(resume_skills) if resume_skills else []
    resume_embs = {s: e for s, e in zip(resume_skills, resume_embeddings_list)}
    
    jd_embeddings_list = get_embedding(jd_skills)
    jd_embs = {s: e for s, e in zip(jd_skills, jd_embeddings_list)}
    
    # Prepare keyword embeddings for multi-word JD skills
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
        
        # Pre-filter: remove resume skills that violate domain isolation for this JD skill
        # This ensures domain isolation applies to ALL match steps (exact, substring, alias, semantic)
        allowed_resume_skills = [
            rs for rs in resume_skills
            if not is_domain_isolated_mismatch(jd_skill, rs)
        ]

        # STEP 1: Exact Match
        if any(jd_skill_lower == rs.lower() for rs in allowed_resume_skills):
            score = 1.0
            match_type = "EXACT"
        
        # STEP 2: Substring Match
        # Rules:
        # 1. Minimum length of 4 chars to avoid "c", "sql" etc matching long phrases
        # 2. Word-boundary check: the resume skill must appear as whole words inside
        #    the JD phrase, not as a partial word (e.g. "node" should not match "nodejs")
        # 3. Only one direction: rs_lower must appear WHOLE in jd_skill_lower
        #    (not the reverse — a long JD phrase is never a substring of a short resume skill)
        if match_type is None:
            import re
            for rs in allowed_resume_skills:
                rs_lower = rs.lower()
                # Direction 1: JD skill contained fully in resume skill (e.g. "sql" in "sqlite")
                jd_in_rs = (len(jd_skill_lower) >= 4 and 
                            re.search(r'(?<![a-z])' + re.escape(jd_skill_lower) + r'(?![a-z])', rs_lower))
                # Direction 2: resume skill contained fully in JD phrase as whole word
                # e.g. "sql" in "structured query language" → NO (not whole word present)
                # e.g. "power bi" in "business intelligence dashboards" → NO
                # e.g. "time-series forecasting" in "time series predictive modeling" → NO  
                rs_in_jd = (len(rs_lower) >= 5 and
                            re.search(r'(?<![a-z])' + re.escape(rs_lower) + r'(?![a-z])', jd_skill_lower))
                if jd_in_rs or rs_in_jd:
                    print(f"[MATCH DEBUG] Substring hit: JD='{jd_skill_lower}' matched RS='{rs_lower}'")
                    score = 1.0
                    match_type = "SUBSTRING"
                    break
        
        # STEP 3: Alias Match (explicit domain knowledge)
        # This handles: SARIMA↔ARIMA, LightGBM↔gradient boosting, etc.
        if match_type is None:
            if alias_match(jd_skill, allowed_resume_skills):
                score = 0.95
                match_type = "ALIAS"
        
        # STEP 4: Semantic Match (high threshold to avoid false positives)
        if match_type is None:
            jd_emb = jd_embs.get(jd_skill)
            max_sim = 0
            for rs in allowed_resume_skills:
                rs_emb = resume_embs.get(rs)
                if rs_emb is None:
                    continue
                sim = cosine_similarity(jd_emb, rs_emb)
                if sim > max_sim:
                    max_sim = sim
            
            if max_sim >= threshold:
                # Strong match ≥0.88 → full credit; otherwise proportional
                score = 1.0 if max_sim >= 0.88 else max_sim
                match_type = "SEMANTIC"
        
        # STEP 5: Keyword Fallback (for multi-word JD skills)
        if match_type is None and jd_skill in jd_to_kws:
            kws = jd_to_kws[jd_skill]
            max_kw_sim = 0
            for kw in kws:
                kw_emb = kw_embs.get(kw)
                if kw_emb is None:
                    continue
                for rs in allowed_resume_skills:
                    rs_emb = resume_embs.get(rs)
                    if rs_emb is None:
                        continue
                    sim = cosine_similarity(kw_emb, rs_emb)
                    if sim > max_kw_sim:
                        max_kw_sim = sim
            
            if max_kw_sim >= threshold:
                score = 0.6
                match_type = "KEYWORD"
        
        print(f"[MATCH DEBUG] {jd_skill!r} -> {match_type or 'NO MATCH'} score={score:.2f}")
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
    
    # DEBUG — remove after confirming correct extraction
    print(f"[MATCH DEBUG] JD skills extracted: {sorted(jd_skills)}")
    print(f"[MATCH DEBUG] Resume skills extracted: {sorted(res_skills)}")
    
    # 3. Match
    return compute_match(jd_skills, res_skills)