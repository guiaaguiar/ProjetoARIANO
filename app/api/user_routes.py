from fastapi import APIRouter, File, UploadFile, Form, HTTPException, BackgroundTasks, Response
from typing import Optional
import tempfile
import os

from app.services.pdf_extractor import extract_text_from_pdf
from app.agents.orchestrator import OrchestratorAgent
from app.core.security import get_password_hash, create_access_token
from app.core.neo4j_driver import run_cypher, is_memory_mode, get_memory_store
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Users"])

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
    curriculo_pdf: Optional[UploadFile] = File(None)
):
    """
    Registra um novo usuário no CORETO com tratamento robusto de erros.
    """
    try:
        # 1. Normalização de dados
        email = email.lower().strip()
        logger.info(f"📝 Iniciando registro: {email} ({user_type})")
        
        # Converte semester para int com segurança
        try:
            val_semester = int(semester) if semester and str(semester).isdigit() else 1
        except:
            val_semester = 1
            
        # 2. Verificação de existência
        if is_memory_mode():
            store = get_memory_store()
            for node in store.get_nodes_by_label("Student") + store.get_nodes_by_label("Researcher") + store.get_nodes_by_label("Professor"):
                if node.get("email") == email:
                    raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado no sistema.")
        else:
            results = run_cypher("MATCH (u) WHERE u.email = $email RETURN u.uid", {"email": email})
            if results:
                raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado no Neo4j.")

        # 3. Extração de Conteúdo (Prioridade PDF > Texto Form)
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
                # Mantém o texto do formulário se o PDF falhar
        
        # 4. Hash de Senha
        password_hash = get_password_hash(password)
        
        # 5. Persistência Base
        uid = str(uuid.uuid4())[:8]
        neo4j_type = {"student": "Student", "researcher": "Researcher", "professor": "Professor"}.get(user_type, "Student")
        
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
            "created_at": datetime.now().isoformat()
        }

        if is_memory_mode():
            store = get_memory_store()
            store.add_node(uid, [neo4j_type], profile_data)
        else:
            run_cypher(f"""
                CREATE (u:{neo4j_type} {{
                    uid: $uid, name: $name, email: $email, password_hash: $password_hash,
                    institution: $institution, course: $course, semester: $semester,
                    bio: $bio, o_que_busco: $o_que_busco, curriculo_texto: $curriculo_texto,
                    created_at: $created_at
                }})
            """, profile_data)
        
        logger.info(f"✅ Usuário {uid} persistido com sucesso.")

        # 6. Ativação da Inteligência (Via Frontend Pipeline)
        # Note: O processamento agora é disparado pelo componente CognitionExperience 
        # no frontend para garantir feedback em tempo real e evitar timeouts de 60s na Vercel.
        logger.info(f"🚀 Cadastro concluído para {uid}. Aguardando pipeline visual.")

        # 7. Auto-login via Cookie
        token = create_access_token({"sub": uid, "type": neo4j_type.lower(), "name": name})
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=True,
            samesite="lax"
        )

        return {
            "status": "success",
            "message": "Cadastro realizado com sucesso!",
            "uid": uid
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"💥 Erro catastrófico no registro: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Erro interno ao processar cadastro: {str(e)}"
        )

@router.get("/check/{uid}")
async def check_user_exists(uid: str):
    """
    Verifica se um usuário existe no grafo persistente. 
    Usado pelo frontend para evitar race conditions antes de iniciar a IA.
    """
    try:
        if is_memory_mode():
            # Forçamos o refresh para garantir que vimos a persistência de outros processos/lambdas
            store = get_memory_store(force_refresh=True)
            user = store.get_node(uid)
            exists = user is not None
        else:
            results = run_cypher("MATCH (u) WHERE u.uid = $uid RETURN u.uid", {"uid": uid})
            exists = len(results) > 0
            
        return {"exists": exists, "uid": uid}
    except Exception as e:
        logger.error(f"❌ Erro no health check do usuário {uid}: {e}")
        return {"exists": False, "uid": uid, "error": str(e)}

@router.post("/reset")
async def reset_database(response: Response):
    """
    LIMPEZA TOTAL: Deleta todos os usuários e limpa o estado.
    (Debug Only)
    """
    try:
        if is_memory_mode():
            store = get_memory_store()
            store.nodes = {}
            store.edges = []
            logger.info("🧹 Memory Store resetada.")
        else:
            run_cypher("MATCH (u) WHERE u:Student OR u:Researcher OR u:Professor OR u:Admin OR u:User DETACH DELETE u")
            logger.info("🧹 Neo4j resetado.")
            
        # Limpa o cookie de autenticação
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
    Called when the user interacts with the final results screen (clicks a match or 'Ver Perfil').
    Persists all user data and match relationships to the graph — deferred persistence pattern.
    """
    try:
        uid = body.uid
        profile_data = body.profile_data
        matches = body.matches

        logger.info(f"💾 Finalizando cadastro de {uid} com {len(matches)} matches.")

        if is_memory_mode():
            store = get_memory_store()
            # Ensure node exists (update it with full profile if needed)
            if not store.get_node(uid):
                neo4j_type = {"student": "Student", "researcher": "Researcher", "professor": "Professor"}.get(
                    profile_data.get("user_type", "student"), "Student"
                )
                store.add_node(uid, [neo4j_type], profile_data)
                logger.info(f"✅ Nó {uid} criado no grafo de memória.")
            
            # Save match edges
            for match in matches:
                edital_uid = match.get("edital_uid", "")
                if edital_uid:
                    store.add_edge(uid, edital_uid, "ELIGIBLE_FOR", {
                        "score": match.get("score", 0.75),
                        "justification": match.get("justification", ""),
                        "source": "cognition_v3",
                    })
        else:
            # Upsert user node
            neo4j_type = {"student": "Student", "researcher": "Researcher", "professor": "Professor"}.get(
                profile_data.get("user_type", "student"), "Student"
            )
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

            # Save match relationships
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
