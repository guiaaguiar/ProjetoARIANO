from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel
from typing import Optional
import logging

from app.core.security import verify_password, create_access_token, decode_access_token
from app.core.neo4j_driver import is_memory_mode, get_memory_store, run_cypher

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    status: str
    message: str
    user_type: Optional[str] = None
    user_uid: Optional[str] = None
    name: Optional[str] = None

def get_user_by_email(email: str):
    if is_memory_mode():
        store = get_memory_store()
        for label in ["Student", "Researcher", "Professor"]:
            for node in store.get_nodes_by_label(label):
                if node.get("email") == email:
                    n = store.nodes.get(node["uid"], {})
                    return {"uid": node["uid"], "type": label.lower(), "password_hash": n["props"].get("password_hash"), "name": node.get("name")}
        return None
        
    query = """
    MATCH (u)
    WHERE (u:Student OR u:Researcher OR u:Professor) AND u.email = $email
    RETURN u.uid AS uid, labels(u)[0] AS type, u.password_hash AS password_hash, u.name AS name
    """
    results = run_cypher(query, {"email": email})
    if results:
        user = results[0]
        return {
            "uid": user.get("uid"),
            "type": user.get("type", "").lower(),
            "password_hash": user.get("password_hash"),
            "name": user.get("name")
        }
    return None


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, response: Response):
    logger.info(f"Login attempt for: {request.email}")
    # Admin dual portal
    if request.email.strip().lower() == "admin@ariano.gov" and request.password.strip() == "admin123":
        logger.info("Admin login matched")
        token = create_access_token({"sub": "admin", "type": "admin", "name": "Admin Gov"})
        response.set_cookie(
            key="auth_token", 
            value=token, 
            httponly=True, 
            secure=True, 
            samesite="lax"
        )
        return AuthResponse(status="success", message="Admin conectado com sucesso", user_type="admin", user_uid="admin", name="Admin Gov")

    user = get_user_by_email(request.email)
    if not user:
        logger.warning(f"User not found: {request.email}")
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
    pwd_hash = user.get("password_hash")
    if pwd_hash:
        if not verify_password(request.password, pwd_hash):
             logger.warning(f"Invalid password for: {request.email}")
             raise HTTPException(status_code=401, detail="Credenciais inválidas")
    else:
        # Fallback for seeded data without hashed passwords
        if request.password != "123456":
             logger.warning(f"Invalid fallback password for: {request.email}")
             raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_access_token({"sub": user["uid"], "type": user["type"], "name": user["name"]})
    response.set_cookie(
        key="auth_token", 
        value=token, 
        httponly=True, 
        secure=True, 
        samesite="lax"
    )
    
    return AuthResponse(
        status="success", 
        message="Login realizado com sucesso", 
        user_type=user["type"],
        user_uid=user["uid"],
        name=user.get("name")
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="auth_token")
    return {"status": "success", "message": "Sessão encerrada"}
    
@router.get("/me", response_model=AuthResponse)
def get_me(request: Request):
    token = request.cookies.get("auth_token")
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
        
    return AuthResponse(
        status="success", 
        message="Autenticado", 
        user_type=payload.get("type"), 
        user_uid=payload.get("sub"),
        name=payload.get("name")
    )
