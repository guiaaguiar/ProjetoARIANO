from __future__ import annotations

"""Neo4j driver.

Strictly connects to Neo4j. In-memory mode has been completely removed 
in favor of Neo4j Aura for production.
"""

import logging
from neo4j import GraphDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)

_driver = None

def get_driver():
    """Get or create Neo4j driver singleton."""
    global _driver
    if _driver is None:
        try:
            logger.info(f"[NEO4J] 🔌 Tentando conectar em {settings.neo4j_uri} (user={settings.neo4j_user})...")
            _driver = GraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password),
                connection_timeout=5.0,
            )

            # Verificação REAL de conectividade
            with _driver.session() as session:
                result = session.run("MATCH (n) RETURN count(n) as total").single()
                total = result["total"] if result else 0

            logger.info(f"[NEO4J] ✅ Conectado em {settings.neo4j_uri} ({total} nós no banco).")
        except Exception as e:
            logger.error(f"[NEO4J] ❌ Falha crítica ao conectar: {e}. O sistema exige o Neo4j Aura para funcionar.")
            if _driver:
                try: _driver.close()
                except: pass
            _driver = None
            raise
    return _driver


def close_driver():
    """Close the Neo4j driver."""
    global _driver
    if _driver:
        _driver.close()
        _driver = None


# --- Dummy functions to prevent import errors in other files for now ---
# --- (These will naturally be bypassed since is_memory_mode is False) ---

def is_memory_mode() -> bool:
    return False

def force_memory_mode():
    pass

def get_memory_store(*args, **kwargs):
    return None

# ---------------------------------------------------------------------

async def run_query(query: str, params: dict | None = None) -> list[dict]:
    """Async wrapper for run_cypher to support service layer."""
    return run_cypher(query, params)

def run_cypher(query: str, params: dict | None = None) -> list[dict]:
    """Execute a Cypher query on Neo4j."""
    driver = get_driver()
    if driver is None:
        return []

    try:
        with driver.session() as session:
            result = session.run(query, params or {})
            return [record.data() for record in result]
    except Exception as e:
        logger.error(f"Cypher query failed: {e}")
        return []

def run_cypher_single(query: str, params: dict | None = None) -> dict | None:
    """Execute a Cypher query and return a single result."""
    results = run_cypher(query, params)
    return results[0] if results else None
