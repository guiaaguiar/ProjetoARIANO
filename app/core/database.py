"""Neo4j database connection setup — Neo4j Aura only."""

import logging

logger = logging.getLogger(__name__)


def init_db() -> None:
    """Initialize Neo4j Aura connection on startup.

    SAFE FOR SERVERLESS: If NEO4J_URI is not configured (e.g. missing Vercel env var),
    this function logs a clear [MISSING_ENV_VARS] warning and returns gracefully.
    The driver will be initialized lazily on the first real request; if it fails
    at that point, a 503 is returned to the caller — NOT a full API crash.
    """
    from app.core.config import settings

    if not settings.neo4j_configured:
        logger.warning(
            "[MISSING_ENV_VARS] init_db() ignorado: NEO4J_URI aponta para localhost. "
            "Defina NEO4J_URI, NEO4J_USER e NEO4J_PASSWORD nas variáveis de ambiente da Vercel."
        )
        return

    from app.core.neo4j_driver import get_driver

    try:
        from neo4j.exceptions import AuthError, ServiceUnavailable
    except ImportError:
        AuthError = Exception
        ServiceUnavailable = Exception

    try:
        get_driver()
        logger.info("✅ Neo4j Aura connection verified on startup.")
    except AuthError as exc:
        logger.error("Falha de credenciais no Neo4j: %s. API iniciada sem banco.", exc)
    except ServiceUnavailable as exc:
        logger.error("Neo4j temporariamente indisponível: %s. API iniciada sem banco.", exc)
    except Exception as exc:
        # Log the error but do NOT re-raise — let individual endpoints fail gracefully
        logger.error(
            "❌ init_db() could not reach Neo4j Aura: %s. "
            "API will start but Neo4j-dependent endpoints will return 503.",
            exc,
        )

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

