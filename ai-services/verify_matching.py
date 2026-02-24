import sys
import os
from unittest.mock import MagicMock

# Mock dependencies
sys.modules["dotenv"] = MagicMock()
sys.modules["vertexai"] = MagicMock()
sys.modules["vertexai.generative_models"] = MagicMock()
sys.modules["vertexai.language_models"] = MagicMock()

# Add the project root to sys.path
sys.path.append(os.getcwd())
# Also append ai-services to support absolute imports if needed
sys.path.append(os.path.join(os.getcwd(), "ai-services"))

from services.matching_service import run_matching_pipeline, normalize_skills, compute_match
import unittest
from unittest.mock import patch, MagicMock

class TestNewMatchingPipeline(unittest.TestCase):

    def test_normalization_and_blacklist(self):
        skills = ["India", "Hyderabad", "Python programming", "Location ", "internship"]
        normalized = normalize_skills(skills)
        
        self.assertIn("python", normalized)
        self.assertNotIn("india", normalized)
        self.assertNotIn("hyderabad", normalized)
        self.assertNotIn("location", normalized)
        self.assertNotIn("internship", normalized)
        print("Normalization & Blacklist Test Passed")

    def test_scoring_logic(self):
        # Mocking embeddings to control cosine similarity
        jd_skills = ["Python", "Time-series forecasting", "Java"]
        resume_skills = ["Python", "SARIMA"]
        
        # 1. Python vs Python -> Exact match (1.0)
        # 2. Time-series vs SARIMA -> Semantic (let's say 0.8)
        # 3. Java -> No match (0)
        
        # Expected scores: 1.0 + 0.8 + 0 = 1.8
        # Fit score: (1.8 / 3) * 100 = 60.0
        
        def mock_get_embedding(text):
            if isinstance(text, list):
                return [mock_get_embedding(t) for t in text]
            # Use 3D vectors to ensure orthogonality
            if text == "Time-series forecasting": return [0, 1, 0]
            if text == "SARIMA": return [0, 0.8, 0.6] # similarity = 0.8 with TS
            if text == "Java": return [0, 0, 1]
            if text == "Python": return [1, 0, 0]
            return [1, 0, 0] # Default to Python-like for others

        with patch('services.matching_service.get_embedding', side_effect=mock_get_embedding):
            # We need to compute match with these mocks
            result = compute_match(jd_skills, resume_skills)
            self.assertEqual(result["fit_score"], 60.0)
            self.assertIn("Python", result["matched_skills"])
            self.assertIn("Time-series forecasting", result["matched_skills"])
            self.assertIn("Java", result["missing_skills"])
            print("Scoring Logic Test Passed")

    def test_full_pipeline_contract(self):
        jd_text = "Looking for a Python developer with experience in forecasting."
        resume_text = "I am a dev skilled in Python and ARIMA models."
        
        # Mock agents and embeddings
        with patch('services.matching_service.extract_jd_skills', return_value=["Python", "Forecasting", "India"]):
            with patch('services.matching_service.extract_resume_skills', return_value=["Python", "ARIMA"]):
                with patch('services.matching_service.get_embedding', return_value=[[1]*768]): # Dummy embeddings
                    result = run_matching_pipeline(jd_text, resume_text)
                    
                    self.assertIsInstance(result["fit_score"], float)
                    self.assertNotIn("India", result["matched_skills"])
                    self.assertNotIn("India", result["missing_skills"])
                    print("Full Pipeline Contract Test Passed")

if __name__ == "__main__":
    # Use simple print since we're on Windows and emojis cause issues
    unittest.main()
