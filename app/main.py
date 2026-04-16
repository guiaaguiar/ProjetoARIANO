"""ARIANO API — FastAPI Application Entry Point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.agent_routes import router as agent_router
from app.api.auth import router as auth_router
from app.api.user_routes import router as user_router
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
    logger.info("🚀 ARIANO API starting up...")
    init_db()

    from app.core.neo4j_driver import is_memory_mode

    if is_memory_mode():
        logger.info("📦 Memory mode — auto-seeding graph data...")
        from app.services.seed_native import seed_native
        from app.agents.eligibility_calculator import EligibilityCalculator
        seed_native()
        logger.info("📦 Computing native ELIGIBLE_FOR matches...")
        calc = EligibilityCalculator()
        calc.llm = None  # Disable LLM calls to prevent blocking backend startup
        calc.calculate_all_matches()
        logger.info("✅ In-memory graph seeded and ready")
    else:
        logger.info("✅ Neo4j connection initialized")

    yield
    # Cleanup
    from app.core.neo4j_driver import close_driver
    close_driver()
    logger.info("👋 ARIANO API shut down")


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
app.include_router(router, prefix="/api")
app.include_router(agent_router, prefix="/api")


@app.get("/health")
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
