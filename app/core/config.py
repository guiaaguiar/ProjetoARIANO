"""ARIANO Backend — Core Configuration."""

import logging
import os
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env from project root
env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(env_path)
# Also try loading from current dir
load_dotenv()

_cfg_logger = logging.getLogger("app.core.config")

# ─── Sentinel for detecting unconfigured env-vars ─────────────────────────
_LOCALHOST_SENTINEL = "bolt://localhost:7687"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Neo4j Aura — MUST be set via environment variables in production
    neo4j_uri: str = _LOCALHOST_SENTINEL
    neo4j_user: str = "neo4j"
    neo4j_password: str = "ariano2026"

    # OpenRouter LLM (NVIDIA Nemotron 3 Super 120B)
    openrouter_api_key: str = ""
    openrouter_model: str = "nvidia/nemotron-3-super-120b-a12b:free"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # CORS (parse from comma-separated string)
    cors_origins_str: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins_str.split(",") if o.strip()]

    @property
    def neo4j_configured(self) -> bool:
        """True only when NEO4J_URI is set to a real Aura URI (not the localhost default)."""
        return (
            self.neo4j_uri != _LOCALHOST_SENTINEL
            and "localhost" not in self.neo4j_uri
            and "127.0.0.1" not in self.neo4j_uri
        )

    # App
    app_name: str = "ARIANO API"
    app_version: str = "1.0.1"
    debug: bool = True
    backend_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

# ─── Startup env-var audit ──────────────────────────────────────────────────
_missing: list[str] = []
if not settings.neo4j_configured:
    _missing.append("NEO4J_URI")
if settings.neo4j_user == "neo4j" and not settings.neo4j_configured:
    _missing.append("NEO4J_USER")
if settings.neo4j_password == "ariano2026" and not settings.neo4j_configured:
    _missing.append("NEO4J_PASSWORD")

if _missing:
    _cfg_logger.warning(
        "[MISSING_ENV_VARS] As seguintes variáveis NÃO estão configuradas no ambiente: %s. "
        "O driver Neo4j NÃO será inicializado automaticamente. "
        "Configure-as na Vercel → Settings → Environment Variables.",
        ", ".join(_missing),
    )
else:
    _cfg_logger.info("[CONFIG] Variáveis de ambiente Neo4j detectadas com sucesso. URI: %s", settings.neo4j_uri[:30])

