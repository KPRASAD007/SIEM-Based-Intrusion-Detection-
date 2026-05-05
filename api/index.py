import sys
import os
from pathlib import Path

# Add the current directory to sys.path to allow importing from 'backend'
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from backend.app.main import app

# Vercel needs 'app' to be the FastAPI instance
# This file serves as the bridge between Vercel and the existing backend structure
