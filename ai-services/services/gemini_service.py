import os
from dotenv import load_dotenv
import vertexai
from vertexai.generative_models import GenerativeModel

PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID")
LOCATION = "us-central1"

load_dotenv()

vertexai.init(project=PROJECT_ID, location=LOCATION)

def call_gemini(prompt):
    model = GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text
