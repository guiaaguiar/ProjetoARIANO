"""Neo4j database connection setup.

Supports two modes:
- Neo4j available → neomodel ORM with full features
- Neo4j unavailable → in-memory fallback via neo4j_driver.py
"""

import logging

logger = logging.getLogger(__name__)


def init_db() -> None:
    """Initialize Neo4j connection. Falls back gracefully if unavailable."""
    # First, trigger driver initialization to detect mode
    from app.core.neo4j_driver import get_driver, is_memory_mode

    get_driver()  # This auto-detects and sets memory mode if needed

    if is_memory_mode():
        logger.info("📦 Running in MEMORY MODE — Neo4j not required")
        return

    # Neo4j is available, configure neomodel
    try:
        from neomodel import config as neo_config
        from app.core.config import settings

        neo_config.DATABASE_URL = (
            f"bolt://{settings.neo4j_user}:{settings.neo4j_password}"
            f"@{settings.neo4j_uri.replace('bolt://', '')}"
        )
        try:
            neo_config.AUTO_INSTALL_LABELS = True
            logger.info("✅ Neo4j + neomodel initialized")
        except Exception as e:
            logger.warning(f"⚠️ neomodel label install failed ({e}), switching to memory mode")
            from app.core.neo4j_driver import force_memory_mode
            force_memory_mode()
    except Exception as e:
        logger.warning(f"⚠️ neomodel init failed ({e}), using memory mode")
        from app.core.neo4j_driver import force_memory_mode
        force_memory_mode()
