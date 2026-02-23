import json
import logging
from services.gemini_service import call_gemini

logger = logging.getLogger(__name__)

async def generate_tailored_resume(original_resume_text: str, job_description: str):
    """
    Tailors a resume based on a job description using Gemini 2.5 Flash.
    """
    
    prompt = f"""
    You are an expert Career Coach and ATS Optimizer. 
    Your task is to rewrite the provided resume to better align with the given Job Description.

    STRICT CONSTRAINTS:
    - NEVER hallucinate or fabricate companies, dates, or degrees.
    - ONLY rewrite or rephrase existing content to highlight relevance.
    - Improve ATS keyword alignment by using relevant terminology from the Job Description.
    - Use strong action verbs (e.g., "Spearheaded", "Optimized", "Architected").
    - Maintain the original meaning and scope of work.
    - BE CONCISE. Avoid overly long bullet points to ensure the response fits the output limit.
    - Output ONLY structured JSON. No conversational text.
    - ENSURE the JSON is complete and properly closed with all ending brackets.

    EXPECTED JSON SCHEMA:
    {{
      "name": "Full Name",
      "email": "Email Address",
      "phone": "Phone Number",
      "summary": "Tailored professional summary focusing on JD requirements",
      "skills": ["Skill 1", "Skill 2"],
      "experience": [
        {{
          "company": "Company Name",
          "role": "Job Title",
          "duration": "Dates",
          "bullets": ["Action-oriented bullet point 1", "Action-oriented bullet point 2"]
        }}
      ],
      "projects": [
        {{
          "title": "Project Name",
          "description": "Tailored project description"
        }}
      ],
      "education": [
        {{
          "degree": "Degree Name",
          "institution": "University/College",
          "year": "Graduation Year"
        }}
      ]
    }}

    JOB DESCRIPTION:
    {job_description}

    ORIGINAL RESUME:
    {original_resume_text}
    """

    try:
        # Using is_json=True to leverage Vertex AI's response_mime_type="application/json"
        raw_response = call_gemini(prompt, is_json=True)
        
        # Safe JSON extraction
        try:
            # Some models might still wrap in markdown code blocks even with mime_type
            cleaned_response = raw_response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[len("```json"):]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            
            tailored_data = json.loads(cleaned_response.strip())
            return tailored_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            logger.error(f"Raw response: {raw_response}")
            return {
                "error": "Failed to parse tailored resume data",
                "details": str(e)
            }
            
    except Exception as e:
        logger.error(f"Error calling Gemini service: {e}")
        return {
            "error": "Internal AI service error",
            "details": str(e)
        }
