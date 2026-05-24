import sys
import subprocess

try:
    import PyPDF2
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    import PyPDF2

def extract_pdf():
    reader = PyPDF2.PdfReader(r'e:\YJF\jamais-vu_-旧事如新-调查员档案\旧事如新jamaisvu_v1_0_0315.pdf')
    with open(r'e:\YJF\jamais-vu_-旧事如新-调查员档案\pdf_text.txt', 'w', encoding='utf-8') as f:
        for page in reader.pages:
            f.write(page.extract_text() + "\n")

if __name__ == "__main__":
    extract_pdf()
