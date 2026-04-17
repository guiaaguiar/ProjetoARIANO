import sys
import os

# Set up path to import app
sys.path.append(os.getcwd())

from app.core.security import get_password_hash
from fastapi import HTTPException

print("--- Testing Password Security Logic ---")

# Test 1: Short password (should work)
try:
    h = get_password_hash("123")
    print("✅ Short password (123) hash generated correctly")
except Exception as e:
    print(f"❌ Short password failed: {e}")

# Test 2: 72 chars password (should work)
try:
    h = get_password_hash("A" * 72)
    print("✅ 72 chars password hash generated correctly")
except Exception as e:
    print(f"❌ 72 chars failed: {e}")

# Test 3: 73 chars password (should fail)
try:
    get_password_hash("A" * 73)
    print("❌ 73 chars password should have failed but didn't")
except HTTPException as e:
    if e.status_code == 400 and "muito longa" in e.detail:
        print(f"✅ 73 chars password failed with correct PT-BR message: {e.detail}")
    else:
        print(f"❌ 73 chars password failed with WRONG message/code: {e.status_code} - {e.detail}")
except Exception as e:
    print(f"❌ 73 chars password failed with generic exception: {type(e).__name__} - {e}")

print("--- Testing Done ---")
