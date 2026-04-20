import logging
import fitz  # PyMuPDF
import time

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts all text from a PDF file provided as bytes.
    Used for extracting CV context without persisting the PDF file.
    """
    start_time = time.time()
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
        
        duration = time.time() - start_time
        logger.info(f"⏱️ PDF Extraction completed in {duration:.2f}s")
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""
