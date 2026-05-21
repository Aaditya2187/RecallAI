#!/usr/bin/env python3
"""
Quick test script to diagnose backend connectivity issues
"""

import sys
import os

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_mongodb():
    """Test MongoDB connection"""
    try:
        from app.db.mongo import sessions_collection
        # Test the connection
        sessions_collection.database.command('ping')
        print("✅ MongoDB: Connection successful")

        # Count documents
        count = sessions_collection.count_documents({})
        print(f"✅ MongoDB: Found {count} sessions")

        return True
    except Exception as e:
        print(f"❌ MongoDB: {e}")
        return False

def test_fastapi_imports():
    """Test FastAPI imports"""
    try:
        from app.main import app
        from app.sessions.api import router as sessions_router
        print("✅ FastAPI: Imports successful")
        return True
    except Exception as e:
        print(f"❌ FastAPI: Import error - {e}")
        return False

def test_endpoints():
    """Test actual endpoints"""
    try:
        import requests
        r = requests.get('http://localhost:8000/sessions', timeout=5)
        print(f"✅ HTTP: Status {r.status_code}")
        print(f"✅ HTTP: Response length {len(r.text)} chars")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ HTTP: Backend server not running")
        print("   Run: uvicorn app.main:app --reload --port 8000")
        return False
    except Exception as e:
        print(f"❌ HTTP: {e}")
        return False

def main():
    print("🔍 Testing Pipeline Backend Connection")
    print("=" * 50)

    mongodb_ok = test_mongodb()
    fastapi_ok = test_fastapi_imports()
    http_ok = test_endpoints()

    print("\n" + "=" * 50)
    if mongodb_ok and fastapi_ok and http_ok:
        print("🎉 All tests passed! Frontend should work.")
        print("   Open: http://localhost:5173")
    else:
        print("❌ Some tests failed. Check the errors above.")
        print("\nCommon fixes:")
        if not mongodb_ok:
            print("   - Start MongoDB: net start MongoDB")
        if not http_ok:
            print("   - Start backend: uvicorn app.main:app --reload --port 8000")

if __name__ == "__main__":
    main()
