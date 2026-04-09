import os
import sys

# Agora que o código do backend foi copiado para dentro da pasta 'api',
# o módulo 'app' pode ser importado diretamente.
# Isso garante compatibilidade total com o Vercel Serverless.

from app.main import app
