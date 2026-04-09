import os
import sys

# Adiciona o diretório 'backend' ao path para que o módulo 'app' possa ser encontrado
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

from app.main import app
