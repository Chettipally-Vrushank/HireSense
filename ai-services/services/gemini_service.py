import os
from dotenv import load_dotenv
import vertexai
from vertexai.generative_models import GenerativeModel
from vertexai.language_models import TextEmbeddingModel

PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID")
LOCATION = "us-central1"

load_dotenv()

vertexai.init(project=PROJECT_ID, location=LOCATION)

def call_gemini(prompt):
    model = GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.2,
            "max_output_tokens": 400
        }
    )
    return response.text

def get_embedding(text):
    if isinstance(text, list):
        # Batch processing (Gemini supports up to 3072 tokens or list of inputs, check limit)
        # Vertex AI limit is usually around 5 inputs per request for gecko? Or verify. 
        # Actually standard limit is 5-20. Let's chunk it to be safe.
        model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        embeddings = []
        for i in range(0, len(text), 5):
            batch = text[i:i+5]
            try:
                batch_embeddings = model.get_embeddings(batch)
                embeddings.extend([e.values for e in batch_embeddings])
            except Exception as e:
                print(f"Error embedding batch {batch}: {e}")
                # Append empty or zeros? Better to skip or retry? 
                # For now, simplistic approach: append empty lists to maintain index alignment?
                # No, upsert depends on index alignment.
                # If batch fails, we lose those skills.
                embeddings.extend([[] for _ in batch]) 
        return embeddings
    else:
        # Single text
        model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        embeddings = model.get_embeddings([text])
        return embeddings[0].values
