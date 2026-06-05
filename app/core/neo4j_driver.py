from __future__ import annotations

"""Neo4j Aura driver — SINGLE SOURCE OF TRUTH.

MemoryGraphStore has been permanently removed.
If Neo4j Aura is unavailable, a clear HTTP 500 is raised.
Connection uses tenacity retry to handle Serverless cold-start transients.
"""

import logging
from typing import Any
from fastapi import HTTPException
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

_driver = None


# ═══════════════════════════════════════════
# DRIVER LIFECYCLE
# ═══════════════════════════════════════════

@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=2),
    retry=retry_if_exception_type(Exception),
    reraise=True,
)
def _connect() -> Any:
    """Attempt to create and verify a Neo4j driver. Retries up to 3 times."""
    from neo4j import GraphDatabase
    from app.core.config import settings

    driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
        keep_alive=True,
        max_connection_lifetime=200,
        max_connection_pool_size=50,
        connection_acquisition_timeout=10.0,
    )
    with driver.session() as session:
        session.run("RETURN 1").single()
    logger.info("✅ Neo4j Aura connection established.")
    return driver


def get_driver() -> Any:
    """Return the Neo4j driver singleton.

    Raises:
        HTTPException 503 — if NEO4J_URI is not configured (missing env var).
        HTTPException 503 — if the Neo4j Aura connection cannot be established.
    """
    global _driver
    if _driver is not None:
        try:
            _driver.verify_connectivity()
            return _driver
        except Exception as e:
            logger.warning(f"Neo4j connection lost in warm start ({e}). Reconnecting silenciosamente...")
            try:
                _driver.close()
            except Exception:
                pass
            _driver = None

    from app.core.config import settings

    if not settings.neo4j_configured:
        logger.error(
            "[MISSING_ENV_VARS] get_driver() chamado mas NEO4J_URI não está configurado. "
            "Defina NEO4J_URI, NEO4J_USER e NEO4J_PASSWORD nas variáveis de ambiente da Vercel."
        )
        raise HTTPException(
            status_code=503,
            detail=(
                "[MISSING_ENV_VARS] Conexão com Neo4j Aura não configurada. "
                "As variáveis NEO4J_URI, NEO4J_USER e NEO4J_PASSWORD devem ser definidas "
                "nas variáveis de ambiente da Vercel (Settings → Environment Variables)."
            ),
        )

    try:
        _driver = _connect()
        return _driver
    except Exception as exc:
        try:
            from neo4j.exceptions import AuthError
            is_auth_error = isinstance(exc, AuthError) or "authentication failure" in str(exc).lower()
        except ImportError:
            is_auth_error = "authentication failure" in str(exc).lower()

        if is_auth_error:
            logger.error(f"❌ Falha de credenciais no Neo4j: {exc}")
            raise HTTPException(
                status_code=503,
                detail="Banco de dados temporariamente inacessível por falha de credenciais. Contate o suporte."
            )

        logger.error(f"❌ Neo4j Aura unreachable after retries: {exc}")
        raise HTTPException(
            status_code=503,
            detail=(
                "Neo4j Aura está inacessível. "
                "Verifique as variáveis NEO4J_URI / NEO4J_USER / NEO4J_PASSWORD "
                f"e a conectividade de rede. Detalhe: {exc}"
            ),
        )



def close_driver() -> None:
    """Close the Neo4j driver."""
    global _driver
    if _driver:
        _driver.close()
        _driver = None
        logger.info("Neo4j driver closed.")


# ═══════════════════════════════════════════
# PUBLIC QUERY API
# ═══════════════════════════════════════════

def run_cypher(query: str, params: dict | None = None) -> list[dict]:
    """Execute a Cypher query against Neo4j Aura.

    Raises:
        HTTPException 500 — propagated from get_driver() or on query failure.
    """
    driver = get_driver()
    try:
        with driver.session() as session:
            result = session.run(query, params or {})
            return [record.data() for record in result]
    except HTTPException:
        raise
    except Exception as exc:
        try:
            from neo4j.exceptions import AuthError
            is_auth_error = isinstance(exc, AuthError) or "authentication failure" in str(exc).lower()
        except ImportError:
            is_auth_error = "authentication failure" in str(exc).lower()
            
        if is_auth_error:
            logger.error(f"❌ Falha de credenciais no Neo4j durante query: {exc}")
            raise HTTPException(
                status_code=503,
                detail="Banco de dados temporariamente inacessível por falha de credenciais. Contate o suporte."
            )

        logger.error(f"Cypher query failed: {exc}\nQuery: {query[:200]}")
        raise HTTPException(status_code=500, detail=f"Cypher query failed: {exc}")


async def run_query(query: str, params: dict | None = None) -> list[dict]:
    """Async wrapper for run_cypher (FastAPI background-task compatibility)."""
    return run_cypher(query, params)


def run_cypher_single(query: str, params: dict | None = None) -> dict | None:
    """Execute a Cypher query and return the first result, or None."""
    results = run_cypher(query, params)
    return results[0] if results else None


# ═══════════════════════════════════════════
# REMOVED — DO NOT USE
# ═══════════════════════════════════════════
# MemoryGraphStore, get_memory_store, is_memory_mode, force_memory_mode,
# _use_memory, _interpret_cypher and all in-memory helpers have been
# permanently deleted. Neo4j Aura is the ONLY persistence layer.
