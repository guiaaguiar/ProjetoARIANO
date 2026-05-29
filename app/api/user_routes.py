from fastapi import APIRouter, File, UploadFile, Form, HTTPException, BackgroundTasks, Response
from typing import Optional
import tempfile
import os

from app.services.pdf_extractor import extract_text_from_pdf, extract_tags_with_llm
from app.agents.orchestrator import OrchestratorAgent
from app.core.security import get_password_hash, create_access_token
from app.core.neo4j_driver import run_cypher
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Users"])

# Mapping of user_type form value → Neo4j label
_TYPE_MAP = {"student": "Student", "docente": "Docente", "researcher": "Docente", "professor": "Docente"}


@router.post("/extract-tags")
async def extract_tags_from_pdf(
    curriculo_pdf: Optional[UploadFile] = File(None),
    curriculo_texto: Optional[str] = Form(""),
):
    """Extract skill tags from a curriculum PDF or raw text using the LLM.

    Returns:
        {"tags": ["Python", "Machine Learning", ...]}
    """
    try:
        text = ""
        if curriculo_pdf and curriculo_pdf.filename:
            content = await curriculo_pdf.read()
            text = extract_text_from_pdf(content)
            logger.info(f"📄 PDF text for tagging: {len(text)} chars")

        if not text and curriculo_texto:
            text = curriculo_texto

        if not text:
            return {"tags": []}

        tags = extract_tags_with_llm(text)
        logger.info(f"🏷️ Extracted {len(tags)} tags: {tags}")
        return {"tags": tags}

    except Exception as e:
        logger.error(f"❌ extract-tags failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Tag extraction failed: {str(e)}")


@router.post("/register")
async def register_user(
    response: Response,
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    institution: str = Form(...),
    course: str = Form(...),
    semester: Optional[str] = Form("1"),
    user_type: str = Form("student"),
    bio: str = Form(""),
    o_que_busco: str = Form(""),
    curriculo_texto: Optional[str] = Form(""),
    skills: Optional[str] = Form(""),  # JSON array string: '["Python","ML"]'
    curriculo_pdf: Optional[UploadFile] = File(None)
):
    """Registra um novo usuário no CORETO diretamente no Neo4j Aura."""
    try:
        email = email.lower().strip()
        logger.info(f"📝 Iniciando registro: {email} ({user_type})")

        try:
            val_semester = int(semester) if semester and str(semester).isdigit() else 1
        except Exception:
            val_semester = 1

        # Verificação de existência no Neo4j
        results = run_cypher("MATCH (u) WHERE u.email = $email RETURN u.uid", {"email": email})
        if results:
            raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado no sistema.")

        # Extração de Conteúdo (Prioridade PDF > Texto Form)
        final_text = curriculo_texto or ""
        if curriculo_pdf and curriculo_pdf.filename:
            try:
                content = await curriculo_pdf.read()
                pdf_extracted = extract_text_from_pdf(content)
                if pdf_extracted:
                    final_text = pdf_extracted
                logger.info(f"📄 Conteúdo extraído: {len(final_text)} caracteres")
            except Exception as pdf_err:
                logger.warning(f"⚠️ Erro ao processar PDF: {pdf_err}")

        password_hash = get_password_hash(password)
        uid = str(uuid.uuid4())[:8]
        neo4j_type = _TYPE_MAP.get(user_type, "Student")

        profile_data = {
            "uid": uid,
            "name": name,
            "email": email,
            "password_hash": password_hash,
            "institution": institution,
            "course": course,
            "semester": val_semester,
            "bio": bio,
            "o_que_busco": o_que_busco,
            "curriculo_texto": final_text,
            "created_at": datetime.now().isoformat(),
        }

        run_cypher(f"""
            CREATE (u:{neo4j_type} {{
                uid: $uid, name: $name, email: $email, password_hash: $password_hash,
                institution: $institution, course: $course, semester: $semester,
                bio: $bio, o_que_busco: $o_que_busco, curriculo_texto: $curriculo_texto,
                created_at: $created_at
            }})
        """, profile_data)

        # Persist HAS_SKILL edges from tags submitted by the user
        import json as _json
        skill_list: list[str] = []
        if skills:
            try:
                parsed = _json.loads(skills)
                if isinstance(parsed, list):
                    skill_list = [str(s).strip() for s in parsed if s]
            except Exception:
                skill_list = [s.strip() for s in skills.split(",") if s.strip()]

        for skill_name in skill_list:
            run_cypher("""
                MERGE (s:Skill {name: $name})
                ON CREATE SET s.uid = $suid, s.category = 'extracted', s.created_at = $ts
                WITH s
                MATCH (u {uid: $uid})
                MERGE (u)-[r:HAS_SKILL]->(s)
                SET r.confidence = 0.9, r.provenance = 'cv_upload'
            """, {
                "name": skill_name,
                "suid": str(uuid.uuid4())[:8],
                "uid": uid,
                "ts": datetime.now().isoformat(),
            })

        logger.info(f"✅ Usuário {uid} persistido no Neo4j Aura com {len(skill_list)} skills.")


        token = create_access_token({"sub": uid, "type": neo4j_type.lower(), "name": name})
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=True,
            samesite="lax",
        )

        return {
            "status": "success",
            "message": "Cadastro realizado com sucesso!",
            "uid": uid,
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"💥 Erro catastrófico no registro: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar cadastro: {str(e)}")


@router.get("/check/{uid}")
async def check_user_exists(uid: str):
    """Verifica se um usuário existe no Neo4j Aura."""
    try:
        results = run_cypher("MATCH (u) WHERE u.uid = $uid RETURN u.uid", {"uid": uid})
        return {"exists": len(results) > 0, "uid": uid}
    except Exception as e:
        logger.error(f"❌ Erro no health check do usuário {uid}: {e}")
        return {"exists": False, "uid": uid, "error": str(e)}


@router.post("/reset")
async def reset_database(response: Response):
    """LIMPEZA TOTAL: Deleta todos os usuários. (Debug Only)"""
    try:
        run_cypher("MATCH (u) WHERE u:Student OR u:Docente DETACH DELETE u")
        logger.info("🧹 Neo4j Aura resetado.")
        response.delete_cookie("auth_token")
        return {"status": "success", "message": "Banco de dados e cookies limpos com sucesso."}
    except Exception as e:
        logger.error(f"❌ Erro ao resetar banco: {e}")
        raise HTTPException(status_code=500, detail=str(e))


from pydantic import BaseModel


class FinalizeRequest(BaseModel):
    uid: str
    profile_data: dict
    matches: list


@router.post("/finalize")
async def finalize_registration(body: FinalizeRequest):
    """
    Persiste skills/matches do pipeline de IA no Neo4j Aura.
    Deferred persistence pattern — chamado após o CognitionExperience.
    """
    try:
        uid = body.uid
        profile_data = body.profile_data
        matches = body.matches

        logger.info(f"💾 Finalizando cadastro de {uid} com {len(matches)} matches.")

        neo4j_type = _TYPE_MAP.get(profile_data.get("user_type", "student"), "Student")

        # Upsert do nó com dados completos
        run_cypher(f"""
            MERGE (u:{neo4j_type} {{uid: $uid}})
            SET u.name = $name, u.email = $email, u.institution = $institution,
                u.course = $course, u.bio = $bio, u.o_que_busco = $o_que_busco,
                u.finalized_at = $ts
        """, {
            "uid": uid,
            "name": profile_data.get("name", ""),
            "email": profile_data.get("email", ""),
            "institution": profile_data.get("institution", ""),
            "course": profile_data.get("course", ""),
            "bio": profile_data.get("bio", ""),
            "o_que_busco": profile_data.get("o_que_busco", ""),
            "ts": datetime.now().isoformat(),
        })

        # Persistir arestas ELIGIBLE_FOR
        for match in matches:
            edital_uid = match.get("edital_uid", "")
            if edital_uid:
                run_cypher("""
                    MATCH (u {uid: $uid})
                    MATCH (e:Edital {uid: $euid})
                    MERGE (u)-[r:ELIGIBLE_FOR]->(e)
                    SET r.score = $score, r.justification = $just, r.source = 'cognition_v3'
                """, {
                    "uid": uid,
                    "euid": edital_uid,
                    "score": match.get("score", 0.75),
                    "just": match.get("justification", ""),
                })

        logger.info(f"✅ Cadastro finalizado com sucesso para {uid}.")
        return {"status": "success", "message": "Perfil e matches salvos no ecossistema."}

    except Exception as e:
        logger.error(f"❌ Erro ao finalizar cadastro: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
