"""Neo4j database connection setup — Neo4j Aura only."""

import logging

logger = logging.getLogger(__name__)


def init_db() -> None:
    """Initialize Neo4j Aura connection and configure neomodel ORM."""
    from app.core.neo4j_driver import get_driver
    from app.core.config import settings

    # Verifies connectivity — raises HTTP 500 if unreachable
    get_driver()

    try:
        from neomodel import config as neo_config

        neo_config.DATABASE_URL = (
            f"bolt://{settings.neo4j_user}:{settings.neo4j_password}"
            f"@{settings.neo4j_uri.replace('bolt://', '').replace('neo4j+s://', '')}"
        )
        neo_config.AUTO_INSTALL_LABELS = True
        logger.info("✅ Neo4j Aura + neomodel initialized")
    except Exception as e:
        logger.warning(f"⚠️ neomodel ORM init failed ({e}). Raw Cypher driver will be used.")
