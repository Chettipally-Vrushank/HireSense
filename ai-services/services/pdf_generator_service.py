import os
import tempfile
from jinja2 import Environment, FileSystemLoader
# import HTML inside function to avoid startup crash if GTK is missing

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated_pdfs")

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_pdf_from_resume(resume_data: dict) -> str:
    """
    Generates an ATS-friendly PDF from resume data using WeasyPrint.
    Returns the absolute path to the generated PDF.
    """
    from weasyprint import HTML
    
    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
    template = env.get_template("ats_resume_template.html")
    
    html_content = template.render(**resume_data)
    
    # Generate a unique filename
    resume_id = resume_data.get("_id", "temp")
    filename = f"resume_{resume_id}.pdf"
    file_path = os.path.join(OUTPUT_DIR, filename)
    
    # Convert HTML to PDF
    HTML(string=html_content).write_pdf(file_path)
    
    return file_path
