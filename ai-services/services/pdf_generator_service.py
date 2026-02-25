import os
from jinja2 import Environment, FileSystemLoader

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated_pdfs")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Map template IDs (sent from frontend) to HTML template filenames
TEMPLATE_MAP = {
    "classic":  "template_classic.html",
    "modern":   "template_modern.html",
    "minimal":  "template_minimal.html",
}
DEFAULT_TEMPLATE = "template_classic.html"


def generate_pdf_from_resume(resume_data: dict) -> str:
    """
    Generates a styled PDF from resume data using WeasyPrint.
    Selects the HTML template based on resume_data['template'].
    Returns the absolute path to the generated PDF.
    """
    from weasyprint import HTML

    # ── Pick template ──────────────────────────────────────────
    template_key = resume_data.get("template", "classic").lower().strip()
    template_file = TEMPLATE_MAP.get(template_key, DEFAULT_TEMPLATE)

    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
    template = env.get_template(template_file)

    # ── Render HTML ────────────────────────────────────────────
    html_content = template.render(**resume_data)

    # ── Write PDF ──────────────────────────────────────────────
    resume_id = resume_data.get("_id", "temp")
    filename = f"resume_{resume_id}_{template_key}.pdf"
    file_path = os.path.join(OUTPUT_DIR, filename)

    HTML(string=html_content).write_pdf(file_path)

    return file_path