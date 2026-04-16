from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import tempfile
import os

from app.services.pdf_extractor import extract_text_from_pdf
from app.agents.orchestrator import OrchestratorAgent
from app.core.security import get_password_hash
from app.core.neo4j_driver import run_cypher, is_memory_mode, get_memory_store
import uuid

router = APIRouter(tags=["Users"])

@router.post("/register")
async def register_user(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    institution: str = Form(...),
    course: str = Form(...),
    semester: int = Form(...),
    user_type: str = Form("student"),
    bio: str = Form(""),
    o_que_busco: str = Form(""),
    curriculo_pdf: Optional[UploadFile] = File(None)
):
    """
    Registra um novo usuário no CORETO.
    """
    
    # Check if email exists
    if is_memory_mode():
        store = get_memory_store()
        for label in ["Student", "Researcher", "Professor"]:
            for node in store.get_nodes_by_label(label):
                if node.get("email") == email:
                    raise HTTPException(status_code=400, detail="Email já cadastrado")
    else:
        results, _ = run_cypher("MATCH (u) WHERE u.email = $email RETURN u.uid", {"email": email})
        if results:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
            
    curriculo_texto = ""
    if curriculo_pdf:
        # Extract text using PyMuPDF
        try:
            content = await curriculo_pdf.read()
            curriculo_texto = extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro ao ler PDF: {str(e)}")
            
    # Process password
    password_hash = get_password_hash(password)
    
    uid = str(uuid.uuid4())[:8]
    profile_data = {
        "name": name,
        "email": email,
        "institution": institution,
        "course": course,
        "semester": semester,
        "bio": bio,
        "o_que_busco": o_que_busco,
        "curriculo_texto": curriculo_texto,
        "password": password_hash,
    }
    
    # Save base user node
    neo4j_type = {"student": "Student", "researcher": "Researcher", "professor": "Professor"}.get(user_type, "Student")
    
    if is_memory_mode():
        store = get_memory_store()
        store.add_node(uid, [neo4j_type], {**profile_data, "password_hash": password_hash})
    else:
        run_cypher(f"""
            CREATE (u:{neo4j_type} {{
                uid: $uid,
                name: $name,
                email: $email,
                password_hash: $password_hash,
                institution: $institution,
                course: $course,
                semester: $semester,
                bio: $bio,
                o_que_busco: $o_que_busco,
                curriculo_texto: $curriculo_texto,
                created_at: datetime()
            }})
        """, {
            "uid": uid,
            "name": name,
            "email": email,
            "password_hash": password_hash,
            "institution": institution,
            "course": course,
            "semester": semester,
            "bio": bio,
            "o_que_busco": o_que_busco,
            "curriculo_texto": curriculo_texto
        })
        
    # Orchestrate LLM Analysis Async or return immediate success and process background
    # Since fast startup is required, we do it inline for MVP or background tasks
    # For Sprint 4, we run orchestrator immediately so the user can see matches instantly
    orchestrator = OrchestratorAgent()
    try:
        orchestrator.process_new_entity(uid, neo4j_type, profile_data)
    except Exception as e:
        print(f"Erro ao processar Orchestrator pipeline para o novo usuário {uid}: {e}")

    return {
        "status": "success",
        "message": "Usuário cadastrado com inteligência ativada.",
        "uid": uid
    }
