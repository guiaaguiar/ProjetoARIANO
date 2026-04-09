import os
import sys

# Garantindo que o diretório 'backend' esteja no sys.path para que o módulo 'app' e seus sub-módulos funcionem
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
backend_path = os.path.join(project_root, "backend")

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Importando o app do backend. 
# O IDE deve agora parar de reclamar se ele considerar o root como fonte ou se o sys.path for resolvido.
from app.main import app
