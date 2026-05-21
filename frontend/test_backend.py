import requests

try:
    print("Testing backend connection...")
    r = requests.get('http://localhost:8000/sessions', timeout=10)
    print(f"✅ Status: {r.status_code}")
    print(f"✅ Response: {r.text[:500]}")
    print("✅ Backend is running and accessible!")
except requests.exceptions.ConnectionError:
    print("❌ Backend is not running or not accessible")
    print("   Make sure to run: cd .. && uvicorn app.main:app --reload --port 8000")
except Exception as e:
    print(f"❌ Error: {e}")
