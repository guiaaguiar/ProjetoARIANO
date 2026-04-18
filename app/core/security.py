import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt

# Secret keys
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-ariano-key-dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    # Bcrypt limited to 72 bytes
    if len(password.encode('utf-8')) > 72:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400, 
            detail="A senha escolhida é muito longa (máximo de 72 caracteres)."
        )
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        import logging
        logging.error(f"Erro ao gerar hash da senha: {e}")
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500, 
            detail="Erro ao processar segurança da conta. Tente novamente."
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
