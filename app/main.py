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

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize Neo4j Aura connection on startup, cleanup on shutdown."""
    logger.info("🚀 ARIANO API starting up...")
    init_db()
    logger.info("✅ Neo4j Aura connection initialized")
    yield
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
        "- `/api/` — CRUD para entidades (Students, Docentes, Editais)\n"
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
    logger = logging.getLogger("app.main")
    logger.error(f"❌ Global unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Erro crítico: {str(exc)}", "type": "GlobalError"},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth")
app.include_router(user_router, prefix="/api/users")
app.include_router(status_router, prefix="/api/users")
app.include_router(router, prefix="/api")
app.include_router(agent_router, prefix="/api")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "version": settings.app_version,
        "service": "ARIANO API",
        "graph_mode": "neo4j_aura",
        "llm_provider": "OpenRouter (Nemotron 3 Super)",
        "llm_configured": bool(settings.openrouter_api_key),
    }
