"""ARIANO Backend — Core Configuration."""

import os
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env from project root
env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(env_path)
# Also try loading from current dir
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Neo4j
    neo4j_uri: str = "bolt://localhost:7687"
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

    # App
    app_name: str = "ARIANO API"
    app_version: str = "1.0.0"
    debug: bool = True
    backend_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
