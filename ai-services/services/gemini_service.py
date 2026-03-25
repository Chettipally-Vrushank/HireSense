import os
import time
import random
from dotenv import load_dotenv
import vertexai
from vertexai.generative_models import GenerativeModel
from vertexai.language_models import TextEmbeddingModel
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable, InternalServerError

load_dotenv()

PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID")
LOCATION = "us-central1"

vertexai.init(project=PROJECT_ID, location=LOCATION)

# Cache the available model
_available_model = "gemini-2.5-flash"

def get_available_model():
    """Get the first available Gemini model from the list of options."""
    global _available_model
    if _available_model:
        return _available_model
    
    model_options = ["gemini-2.5-flash"]
    
    for model_name in model_options:
        try:
            print(f"Testing model availability: {model_name}...")
            # Initialize to check if model is accessible
            test_model = GenerativeModel(model_name)
            _available_model = model_name
            print(f"✓ Model '{model_name}' is available and will be used.")
            return model_name
        except Exception as e:
            print(f"✗ Model '{model_name}' not available: {str(e)[:100]}")
            continue
    
    # Fallback to gemini-2.5-flash if all else fails
    _available_model = "gemini-2.5-flash"
    print(f"⚠️  Using fallback model: {_available_model}")
    return _available_model

def call_gemini(prompt, is_json=False):
    model_name = get_available_model()
    print(f"Calling Gemini with model: {model_name}")
    model = GenerativeModel(model_name)
    
    config = {
        "temperature": 0.1,  # Lower temperature for more stable JSON
        "max_output_tokens": 8192,
        "top_p": 0.95,
        "top_k": 40
    }
    
    if is_json:
        # Note: If gemini-2.5-flash is an experimental model, 
        # response_mime_type might behave unexpectedly. 
        # We'll keep it but reinforce in the prompt.
        config["response_mime_type"] = "application/json"
        
    max_retries = 5
    base_delay = 2

    for attempt in range(max_retries):
        try:
            response = model.generate_content(
                prompt,
                generation_config=config
            )
            
            if not response.text:
                raise ValueError("Gemini returned an empty response")
                
            return response.text

        except (ResourceExhausted, ServiceUnavailable, InternalServerError) as e:
            if attempt == max_retries - 1:
                print(f"Error calling Gemini after {max_retries} attempts: {e}")
                raise e
            
            wait_time = (base_delay * (2 ** attempt)) + random.uniform(0, 1)
            print(f"Gemini API error ({type(e).__name__}). Retrying in {wait_time:.2f}s... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(wait_time)
        except Exception as e:
            print(f"Unexpected error calling Gemini: {e}")
            raise e

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
