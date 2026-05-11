"""ARIANO API — FastAPI Application Entry Point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.api.agent_routes import router as agent_router
from app.api.auth import router as auth_router
from app.api.user_routes import router as user_router
from app.api.status_routes import router as status_router
from app.core.config import settings
from app.core.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup, auto-seed in memory mode, cleanup on shutdown."""
    logger.info("[STARTUP] 🚀 ARIANO API iniciando...")
    init_db()

    from app.core.neo4j_driver import is_memory_mode

    if is_memory_mode():
        logger.info("[STARTUP] 📦 Modo memória ativo — rodando seed inicial...")
        from app.services.seed_native import seed_native
        seed_native()
    else:
        logger.info("[STARTUP] ✅ Neo4j conectado e pronto.")

    yield
    from app.core.neo4j_driver import close_driver
    close_driver()
    logger.info("[STARTUP] 👋 ARIANO API encerrada.")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "**ARIANO** — Arquitetura de Inteligência Artificial Naturalmente Ordenada\n\n"
        "Motor de Matchmaking Inteligente para a plataforma CORETO.\n\n"
        "## Endpoints principais:\n"
        "- `/api/` — CRUD para entidades (Students, Researchers, Professors, Editais)\n"
        "- `/api/agents/` — Operações dos Agentes IA (análise, interpretação, cálculo de matches)\n"
        "- `/api/graph` — Dados do grafo para visualização\n"
        "- `/api/agents/matches` — Consulta de matches O(1) via Cypher\n"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logger = logging.getLogger("app.main")
    logger.error(f"❌ Global unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Erro crítico: {str(exc)}", "type": "GlobalError"},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(user_router, prefix="/api/users")
app.include_router(status_router, prefix="/api/users")
app.include_router(router, prefix="/api")
app.include_router(agent_router, prefix="/api")


@app.get("/api/health")
def health():
    from app.core.neo4j_driver import is_memory_mode
    return {
        "status": "ok",
        "version": settings.app_version,
        "service": "ARIANO API",
        "graph_mode": "in-memory" if is_memory_mode() else "neo4j",
        "llm_provider": "OpenRouter (Nemotron 3 Super)",
        "llm_configured": bool(settings.openrouter_api_key),
    }


@app.get("/api/health/neo4j")
def health_neo4j():
    """Endpoint de saúde do Neo4j. Uso exclusivo de desenvolvimento/debug."""
    from app.core.neo4j_driver import is_memory_mode, get_memory_store, run_cypher
    mode = "memory" if is_memory_mode() else "neo4j"
    node_count = 0
    edge_count = 0
    try:
        if is_memory_mode():
            store = get_memory_store()
            node_count = len(store.nodes)
            edge_count = len(store.edges)
        else:
            res = run_cypher("MATCH (n) RETURN count(n) as nodes")
            node_count = res[0]["nodes"] if res else 0
            res_e = run_cypher("MATCH ()-[r]->() RETURN count(r) as edges")
            edge_count = res_e[0]["edges"] if res_e else 0
    except Exception as e:
        return {"neo4j_connected": False, "mode": mode, "error": str(e)}
    return {
        "neo4j_connected": not is_memory_mode(),
        "mode": mode,
        "node_count": node_count,
        "edge_count": edge_count,
    }
