"""ARIANO Backend — Core Configuration."""

import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Neo4j
    neo4j_uri: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user: str = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password: str = os.getenv("NEO4J_PASSWORD", "ariano2026")

    # Google Gemini
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")

    # CORS
    cors_origins: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173"
    ).split(",")

    # App
    app_name: str = "ARIANO API"
    app_version: str = "0.1.0"
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"

    class Config:
        env_file = ".env"


settings = Settings()
