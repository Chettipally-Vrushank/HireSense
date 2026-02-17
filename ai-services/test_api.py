import requests

def test_resume_text():
    url = "http://127.0.0.1:8000/ai/parse-resume-text"
    payload = {
        "resume_text": "Experienced software engineer with 5 years of Python development."
    }
    try:
        response = requests.post(url, json=payload)
        print("Text Parse Response:", response.status_code)
        print(response.json())
    except Exception as e:
        print(f"Error testing text parse: {e}")

if __name__ == "__main__":
    test_resume_text()
