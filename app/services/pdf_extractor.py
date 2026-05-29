import logging
import re
import json
import fitz  # PyMuPDF
import time

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF bytes (used as input to LLM tag extractor)."""
    start = time.time()
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = "\n".join(page.get_text() for page in doc)
        doc.close()
        logger.info(f"⏱️ PDF text extraction: {time.time() - start:.2f}s ({len(text)} chars)")
        return text.strip()
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return ""


def extract_tags_with_llm(text: str) -> list[str]:
    """Call OpenRouter LLM to extract skill tags from curriculum text.

    Returns a JSON array of tag strings.
    Falls back to rule-based extraction if LLM is unavailable.
    """
    try:
        from app.core.config import settings
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import HumanMessage

        if not settings.openrouter_api_key:
            raise ValueError("OPENROUTER_API_KEY not set")

        llm = ChatOpenAI(
            model=settings.openrouter_model,
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            max_tokens=256,
            temperature=0.1,
        )

        prompt = (
            "Analise o texto de currículo abaixo e retorne EXCLUSIVAMENTE um array JSON "
            "contendo as habilidades técnicas e tags relevantes do perfil. "
            "Não inclua texto adicional, apenas o array JSON. Máximo de 15 tags. "
            "Exemplos de formato: [\"Python\", \"Gestão de Projetos\", \"Machine Learning\", \"Neo4j\"]\n\n"
            f"CURRÍCULO:\n{text[:3000]}"
        )

        response = llm.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        # Strip markdown code fences if present
        raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
        raw = re.sub(r"\s*```$", "", raw, flags=re.MULTILINE)

        tags = json.loads(raw.strip())
        if isinstance(tags, list):
            return [str(t).strip() for t in tags if t][:15]
        return []

    except Exception as e:
        logger.warning(f"LLM tag extraction failed ({e}), using rule-based fallback")
        return _extract_tags_rule_based(text)


def _extract_tags_rule_based(text: str) -> list[str]:
    """Regex-based fallback tag extractor."""
    TECH_KEYWORDS = [
        "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI",
        "Django", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Neo4j", "Redis",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Machine Learning", "Deep Learning",
        "NLP", "Computer Vision", "TensorFlow", "PyTorch", "scikit-learn", "Pandas",
        "NumPy", "Spark", "Hadoop", "Power BI", "Tableau", "Excel", "Git",
        "C", "C++", "Rust", "Go", "R", "MATLAB", "LaTeX", "Linux",
        "Inovação", "Gestão de Projetos", "Pesquisa", "Empreendedorismo",
        "Saúde Digital", "HealthTech", "GovTech", "AgriTech", "EdTech",
    ]
    text_lower = text.lower()
    found = [kw for kw in TECH_KEYWORDS if kw.lower() in text_lower]
    return found[:12]
