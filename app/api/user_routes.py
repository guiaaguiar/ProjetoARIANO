from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import tempfile
import os

from app.services.pdf_extractor import extract_text_from_pdf
from app.agents.orchestrator import OrchestratorAgent
from app.core.security import get_password_hash
from app.core.neo4j_driver import run_cypher, is_memory_mode, get_memory_store
import uuid
import logging

logger = logging.getLogger(__name__)

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
    email = email.lower().strip()
    logger.info(f"Registering user with email: {email}")
    
    if is_memory_mode():
        store = get_memory_store()
        # Count total nodes for debugging
        total_nodes = len(store.nodes)
        logger.info(f"Memory mode active. Total nodes in store: {total_nodes}")
        
        for label in ["Student", "Researcher", "Professor"]:
            for node_id, node in store.nodes.items():
                # Check for all node types just in case
                if node.get("props", {}).get("email") == email:
                    logger.warning(f"Email {email} found in memory store (uid: {node_id})")
                    raise HTTPException(status_code=400, detail="Email já cadastrado")
    else:
        results, _ = run_cypher("MATCH (u) WHERE u.email = $email RETURN u.uid", {"email": email})
        if results:
            logger.warning(f"Email {email} found in Neo4j")
            raise HTTPException(status_code=400, detail="Email já cadastrado")
            
    curriculo_texto = ""
    if curriculo_pdf:
        # Extract text using PyMuPDF
        try:
            logger.info(f"Extracting text from PDF for {email}")
            content = await curriculo_pdf.read()
            curriculo_texto = extract_text_from_pdf(content)
            logger.info(f"PDF extraction successful. Length: {len(curriculo_texto)}")
        except Exception as e:
            logger.error(f"Error reading PDF for {email}: {e}")
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
    
    try:
        if is_memory_mode():
            store = get_memory_store()
            store.add_node(uid, [neo4j_type], {**profile_data, "password_hash": password_hash})
            logger.info(f"User {uid} added to memory store")
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
            logger.info(f"User {uid} added to Neo4j")
    except Exception as e:
        logger.error(f"Error saving user {email} to DB: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco: {str(e)}")
        
    # Orchestrate LLM Analysis
    orchestrator = OrchestratorAgent()
    try:
        logger.info(f"Starting Orchestrator for {uid}")
        orchestrator.process_new_entity(uid, neo4j_type, profile_data)
        logger.info(f"Orchestrator completed for {uid}")
    except Exception as e:
        logger.error(f"Orchestrator pipeline failed for {uid}: {e}")
    
    return {
        "status": "success",
        "message": "Usuário cadastrado com inteligência ativada.",
        "uid": uid
    }
