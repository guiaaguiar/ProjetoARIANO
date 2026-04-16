from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel
from typing import Optional

from app.core.security import verify_password, create_access_token, decode_access_token
from app.core.neo4j_driver import is_memory_mode, get_memory_store, run_cypher

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
    results, _ = run_cypher(query, {"email": email})
    if results:
        return {
            "uid": results[0][0],
            "type": results[0][1].lower(),
            "password_hash": results[0][2],
            "name": results[0][3]
        }
    return None


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, response: Response):
    # Admin dual portal
    if request.email == "admin@ariano.gov" and request.password == "admin123":
        token = create_access_token({"sub": "admin", "type": "admin", "name": "Admin Gov"})
        response.set_cookie(key="auth_token", value=token, httponly=True, secure=False, samesite="lax")
        return AuthResponse(status="success", message="Admin logged in", user_type="admin", user_uid="admin", name="Admin Gov")

    user = get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
    pwd_hash = user.get("password_hash")
    if pwd_hash:
        if not verify_password(request.password, pwd_hash):
             raise HTTPException(status_code=401, detail="Credenciais inválidas")
    else:
        # Fallback for seeded data without hashed passwords
        if request.password != "123456":
             raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_access_token({"sub": user["uid"], "type": user["type"], "name": user["name"]})
    response.set_cookie(key="auth_token", value=token, httponly=True, secure=False, samesite="lax")
    
    return AuthResponse(
        status="success", 
        message="Logged in", 
        user_type=user["type"],
        user_uid=user["uid"],
        name=user.get("name")
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="auth_token")
    return {"status": "success", "message": "Logged out"}
    
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
        message="Auth valid", 
        user_type=payload.get("type"), 
        user_uid=payload.get("sub"),
        name=payload.get("name")
    )
