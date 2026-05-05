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

        # 6. Ativação da Inteligência (Assíncrona)
        # Movemos o processamento pesado para BackgroundTasks para evitar 504 Gateway Timeout
        try:
            orchestrator = OrchestratorAgent()
            background_tasks.add_task(orchestrator.process_new_entity, uid, neo4j_type, profile_data)
            logger.info(f"🧠 Orquestrador agendado em segundo plano para o usuário {uid}")
        except Exception as ai_err:
            logger.error(f"❌ Falha ao agendar orquestrador IA: {ai_err}")

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
