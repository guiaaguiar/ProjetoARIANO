from __future__ import annotations

"""API Routes — CRUD + Match + Graph."""

from typing import Optional
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    SkillCreate, SkillResponse,
    AreaCreate, AreaResponse,
    StudentCreate, StudentResponse,
    DocenteCreate, DocenteResponse,
    EditalCreate, EditalResponse,
    MatchResponse, GraphData, DashboardStats,
)
from app.services import crud

router = APIRouter()


# ═══════════════════════════════════════════
# DASHBOARD
# ═══════════════════════════════════════════

@router.get("/stats", response_model=DashboardStats, tags=["Dashboard"])
def get_stats():
    return crud.get_dashboard_stats()


# ═══════════════════════════════════════════
# SKILLS
# ═══════════════════════════════════════════

@router.get("/skills", response_model=list[SkillResponse], tags=["Skills"])
def get_skills():
    return crud.list_skills()

@router.post("/skills", response_model=SkillResponse, status_code=201, tags=["Skills"])
def post_skill(data: SkillCreate):
    return crud.create_skill(data)

@router.delete("/skills/{uid}", tags=["Skills"])
def remove_skill(uid: str):
    if not crud.delete_skill(uid):
        raise HTTPException(404, "Skill not found")
    return {"ok": True}


# ═══════════════════════════════════════════
# AREAS
# ═══════════════════════════════════════════

@router.get("/areas", response_model=list[AreaResponse], tags=["Areas"])
def get_areas():
    return crud.list_areas()

@router.post("/areas", response_model=AreaResponse, status_code=201, tags=["Areas"])
def post_area(data: AreaCreate):
    return crud.create_area(data)

@router.delete("/areas/{uid}", tags=["Areas"])
def remove_area(uid: str):
    if not crud.delete_area(uid):
        raise HTTPException(404, "Area not found")
    return {"ok": True}


# ═══════════════════════════════════════════
# STUDENTS
# ═══════════════════════════════════════════

@router.get("/students", response_model=list[StudentResponse], tags=["Students"])
def get_students():
    return crud.list_students()

@router.get("/students/{uid}", response_model=StudentResponse, tags=["Students"])
def get_student(uid: str):
    result = crud.get_student(uid)
    if not result:
        raise HTTPException(404, "Student not found")
    return result

@router.post("/students", response_model=StudentResponse, status_code=201, tags=["Students"])
def post_student(data: StudentCreate):
    return crud.create_student(data)

@router.put("/students/{uid}", response_model=StudentResponse, tags=["Students"])
def put_student(uid: str, data: StudentCreate):
    result = crud.update_student(uid, data)
    if not result:
        raise HTTPException(404, "Student not found")
    return result

@router.delete("/students/{uid}", tags=["Students"])
def remove_student(uid: str):
    if not crud.delete_student(uid):
        raise HTTPException(404, "Student not found")
    return {"ok": True}


# ═══════════════════════════════════════════
# DOCENTES  (unified Researcher + Professor)
# ═══════════════════════════════════════════

@router.get("/docentes", response_model=list[DocenteResponse], tags=["Docentes"])
def get_docentes():
    return crud.list_docentes()

@router.get("/docentes/{uid}", response_model=DocenteResponse, tags=["Docentes"])
def get_docente(uid: str):
    result = crud.get_docente(uid)
    if not result:
        raise HTTPException(404, "Docente not found")
    return result

@router.post("/docentes", response_model=DocenteResponse, status_code=201, tags=["Docentes"])
def post_docente(data: DocenteCreate):
    return crud.create_docente(data)

@router.put("/docentes/{uid}", response_model=DocenteResponse, tags=["Docentes"])
def put_docente(uid: str, data: DocenteCreate):
    result = crud.update_docente(uid, data)
    if not result:
        raise HTTPException(404, "Docente not found")
    return result

@router.delete("/docentes/{uid}", tags=["Docentes"])
def remove_docente(uid: str):
    crud.delete_docente(uid)
    return {"ok": True}

# Backward-compat aliases (keep old URLs working)
@router.get("/researchers", response_model=list[DocenteResponse], tags=["Docentes"])
def get_researchers(): return crud.list_docentes()

@router.get("/professors", response_model=list[DocenteResponse], tags=["Docentes"])
def get_professors(): return crud.list_docentes()


# ═══════════════════════════════════════════
# EDITAIS
# ═══════════════════════════════════════════

@router.get("/editais", response_model=list[EditalResponse], tags=["Editais"])
def get_editais():
    return crud.list_editais()

@router.get("/editais/{uid}", response_model=EditalResponse, tags=["Editais"])
def get_edital(uid: str):
    result = crud.get_edital(uid)
    if not result:
        raise HTTPException(404, "Edital not found")
    return result

@router.post("/editais", response_model=EditalResponse, status_code=201, tags=["Editais"])
def post_edital(data: EditalCreate):
    return crud.create_edital(data)

@router.put("/editais/{uid}", response_model=EditalResponse, tags=["Editais"])
def put_edital(uid: str, data: EditalCreate):
    result = crud.update_edital(uid, data)
    if not result:
        raise HTTPException(404, "Edital not found")
    return result

@router.delete("/editais/{uid}", tags=["Editais"])
def remove_edital(uid: str):
    if not crud.delete_edital(uid):
        raise HTTPException(404, "Edital not found")
    return {"ok": True}


# ═══════════════════════════════════════════
# MATCHES
# ═══════════════════════════════════════════

@router.get("/matches", response_model=list[MatchResponse], tags=["Matches"])
def get_matches(entity_uid: Optional[str] = None, threshold: float = 0.0):
    return crud.get_matches(entity_uid, threshold)


# ═══════════════════════════════════════════
# GRAPH (for Sigma.js visualization)
# ═══════════════════════════════════════════

@router.get("/graph", response_model=GraphData, tags=["Graph"])
def get_graph():
    return crud.get_graph_data()

@router.get("/graph/enriched", tags=["Graph"])
async def get_enriched_graph():
    """Retorna o grafo com detecção de comunidades e centralidade via NetworkX."""
    from app.services.graph_analysis import GraphAnalysisService
    return await GraphAnalysisService.get_enriched_graph()

@router.get("/graph/drawing", tags=["Graph"])
async def get_graph_drawing():
    """Retorna uma imagem base64 gerada 100% nativamente pelo NetworkX (Matplotlib)."""
    from app.services.graph_analysis import GraphAnalysisService
    return await GraphAnalysisService.get_networkx_drawing()

@router.get("/graph/insight/{user_uid}", tags=["Graph"])
async def get_graph_insight(user_uid: str):
    """Retorna um insight textual sobre a posição do usuário no grafo."""
    from app.services.graph_analysis import GraphAnalysisService
    return {"insight": await GraphAnalysisService.get_user_insight(user_uid)}


# ═══════════════════════════════════════════
# SEED & PIPELINE
# ═══════════════════════════════════════════

@router.post("/seed", tags=["Admin"])
def seed_database():
    """Semeia o banco Neo4j Aura com dados base."""
    from app.services.seed_native import seed_native
    try:
        seed_native()
        return {"status": "Database seeded successfully"}
    except Exception as e:
        raise HTTPException(500, f"Seed failed: {str(e)}")



@router.post("/pipeline", tags=["Admin"])
def run_pipeline():
    """Run the full AI pipeline: analyze profiles → interpret editais → calculate matches."""
    from app.services.seed_and_configure import run_pipeline as pipeline
    try:
        result = pipeline()
        return {"status": "ok", "message": "Pipeline completed", "data": result}
    except Exception as e:
        raise HTTPException(500, f"Pipeline failed: {str(e)}")


@router.post("/seed-and-configure", tags=["Admin"])
def seed_and_run():
    """Seed database + run full AI pipeline in one step."""
    from app.services.seed_native import seed_native
    from app.services.seed_and_configure import run_pipeline as pipeline
    try:
        seed_native()
        result = pipeline()
        return {"status": "ok", "message": "Seed + Pipeline completed", "data": result}
    except Exception as e:
        raise HTTPException(500, f"Seed+Pipeline failed: {str(e)}")

