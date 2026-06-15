"""ARIANO Backend — Security utilities.

JWT_SECRET é carregado via ``app.core.config.settings`` (Pydantic-Settings)
somente no momento de *uso* das funções (lazy loading).  Isso evita que um
ValueError no nível de módulo derrube o Vercel Runtime durante o Cold Start
antes mesmo do FastAPI inicializar.

Se JWT_SECRET não estiver configurado quando uma rota de auth for chamada,
as funções abaixo lançam HTTPException 500 com uma mensagem amigável em JSON,
e registram o erro real nos logs do servidor.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import HTTPException

logger = logging.getLogger(__name__)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias


def _get_secret() -> str:
    """Retorna o JWT_SECRET lido do Settings no momento de uso (lazy loading).

    Raises:
        HTTPException 500: se a variável não estiver configurada no ambiente.
    """
    from app.core.config import settings  # import local evita ciclos e crashes

    secret = settings.jwt_secret
    if not secret:
        logger.critical(
            "[SECURITY] JWT_SECRET não está configurado no ambiente. "
            "Configure a variável JWT_SECRET nas Environment Variables do Vercel."
        )
        raise HTTPException(
            status_code=500,
            detail="Erro interno de configuração de segurança.",
        )
    return secret


# ---------------------------------------------------------------------------
# Password utilities
# ---------------------------------------------------------------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    # Bcrypt is limited to 72 bytes
    if len(password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="A senha escolhida é muito longa (máximo de 72 caracteres).",
        )
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")
    except Exception as e:
        logger.error(f"Erro ao gerar hash da senha: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro ao processar segurança da conta. Tente novamente.",
        )


# ---------------------------------------------------------------------------
# JWT utilities — secret é resolvido de forma lazy a cada chamada
# ---------------------------------------------------------------------------

def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """Gera um JWT assinado.  Lança HTTP 500 se JWT_SECRET não estiver configurado."""
    secret = _get_secret()  # lazy — valida apenas quando a rota é chamada

    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decodifica e valida um JWT.  Retorna None se inválido/expirado.
    Lança HTTP 500 se JWT_SECRET não estiver configurado."""
    secret = _get_secret()  # lazy — valida apenas quando a rota é chamada

    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
