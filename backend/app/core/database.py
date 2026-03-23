"""Neo4j database connection setup."""

from neomodel import config as neo_config

from app.core.config import settings


def init_db() -> None:
    """Initialize Neo4j connection via neomodel."""
    neo_config.DATABASE_URL = (
        f"bolt://{settings.neo4j_user}:{settings.neo4j_password}"
        f"@{settings.neo4j_uri.replace('bolt://', '')}"
    )
    neo_config.AUTO_INSTALL_LABELS = True
