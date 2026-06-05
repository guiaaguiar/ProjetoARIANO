from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel
from typing import Optional
import logging

from app.core.security import verify_password, create_access_token, decode_access_token
from app.core.neo4j_driver import run_cypher

# Neo4j exception types for resilience
try:
    from neo4j.exceptions import AuthError as Neo4jAuthError, ServiceUnavailable as Neo4jServiceUnavailable
except ImportError:  # pragma: no cover
    Neo4jAuthError = Exception  # type: ignore[assignment,misc]
    Neo4jServiceUnavailable = Exception  # type: ignore[assignment,misc]

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
    # Token incluído no body para dar flexibilidade ao Frontend quando
    # cookies cross-domain falham (ex: mobile apps, testes, domínios diferentes)
    access_token: Optional[str] = None


# =============================================================================
# HELPERS
# =============================================================================

def _set_auth_cookie(response: Response, token: str) -> None:
    """Configura o cookie JWT com todas as flags de segurança para produção.

    - httponly=True  → Impede acesso via JS (mitiga XSS)
    - secure=True    → Exige HTTPS (produção)
    - samesite=none  → Obrigatório para cross-domain na Vercel
                       (frontend e backend em subdomínios diferentes)
    - max_age        → 7 dias (alinhado com ACCESS_TOKEN_EXPIRE_MINUTES)
    """
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",  # cross-domain Vercel: frontend ≠ backend subdomain
        max_age=60 * 60 * 24 * 7,  # 7 dias em segundos
        path="/",
    )


def _extract_token(request: Request) -> Optional[str]:
    """Extrai o JWT de duas fontes, com prioridade para Cookie.

    1. Cookie `auth_token` (produção normal, HttpOnly)
    2. Header `Authorization: Bearer <token>` (apps mobile, Swagger, testes)
    """
    token = request.cookies.get("auth_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
    return token or None


def get_user_by_email(email: str) -> Optional[dict]:
    """Busca usuário no Neo4j Aura por e-mail. Retorna None se não encontrado."""
    query = """
    MATCH (u)
    WHERE (u:Student OR u:Docente) AND u.email = $email
    RETURN u.uid AS uid, labels(u)[0] AS type, u.password_hash AS password_hash, u.name AS name
    """
    results = run_cypher(query, {"email": email})
    if results:
        user = results[0]
        return {
            "uid": user.get("uid"),
            "type": user.get("type", "").lower(),
            "password_hash": user.get("password_hash"),
            "name": user.get("name"),
        }
    return None


# =============================================================================
# DEPENDENCY INJETÁVEL — reutilizável em qualquer rota protegida
# =============================================================================

def get_current_user(request: Request) -> dict:
    """FastAPI dependency que valida o JWT e retorna o payload.

    Aceita token via Cookie (produção) ou header Authorization: Bearer (APIs/testes).
    Levanta HTTP 401 se o token estiver ausente, inválido ou expirado.

    Uso:
        @router.get("/protected")
        def protected(current_user: dict = Depends(get_current_user)):
            ...
    """
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    return payload


# =============================================================================
# ROTAS
# =============================================================================

@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, response: Response):
    """Autentica o usuário, emite JWT via Cookie seguro e no corpo da resposta."""
    logger.info(f"Login attempt for: {request.email}")

    try:
        user = get_user_by_email(request.email.lower().strip())
    except HTTPException:
        raise  # propaga 503 do driver sem modificação
    except (Neo4jAuthError, Neo4jServiceUnavailable) as e:
        logger.error(f"❌ Neo4j auth/availability failure no login: {e}")
        raise HTTPException(
            status_code=503,
            detail="Banco de dados temporariamente inacessível. Tente novamente em instantes.",
        )

    if not user:
        logger.warning(f"User not found: {request.email}")
        # Mesmo erro para usuário inexistente ou senha errada (mitiga user enumeration)
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    pwd_hash = user.get("password_hash")
    if not pwd_hash:
        logger.warning(f"Conta sem password_hash: {request.email}")
        raise HTTPException(status_code=401, detail="Conta sem senha configurada. Contate o suporte.")

    if not verify_password(request.password, pwd_hash):
        logger.warning(f"Invalid password for: {request.email}")
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_access_token({"sub": user["uid"], "type": user["type"], "name": user["name"]})

    # Cookie seguro para produção cross-domain (Vercel)
    _set_auth_cookie(response, token)

    logger.info(f"✅ Login bem-sucedido: uid={user['uid']} type={user['type']}")
    return AuthResponse(
        status="success",
        message="Login realizado com sucesso",
        user_type=user["type"],
        user_uid=user["uid"],
        name=user.get("name"),
        access_token=token,  # também no body para flexibilidade do frontend
    )


@router.post("/logout")
def logout(response: Response):
    """Encerra a sessão deletando o cookie com as mesmas flags que foram usadas no set."""
    response.delete_cookie(
        key="auth_token",
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    return {"status": "success", "message": "Sessão encerrada"}


@router.get("/me", response_model=AuthResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """Retorna os dados do usuário autenticado.

    Aceita JWT via Cookie ou Authorization: Bearer header.
    """
    return AuthResponse(
        status="success",
        message="Autenticado",
        user_type=current_user.get("type"),
        user_uid=current_user.get("sub"),
        name=current_user.get("name"),
    )
