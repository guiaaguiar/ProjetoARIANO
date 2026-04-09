import os
import sys

# Define o caminho para a pasta 'api' onde o bundle do backend foi colocado
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Agora o import 'app' deve funcionar pois 'api/' está no path
from app.main import app
