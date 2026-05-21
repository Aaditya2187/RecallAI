# Troubleshooting: "Failed to fetch" / CORS Error

## Problem
You're getting:
- "Failed to fetch" in the frontend
- CORS errors in browser console
- 500 Internal Server Error from backend

## Solution Steps

### Step 1: Ensure MongoDB is Running

**Check if MongoDB is running:**
```bash
# Windows (Command Prompt)
net start MongoDB

# Or check if mongod.exe is running in Task Manager
```

**If MongoDB isn't installed:**
1. Download from https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start the service: `net start MongoDB`

### Step 2: Restart Backend Server

**Stop any existing backend server** (Ctrl+C in the terminal where it's running), then:

```bash
cd C:\Users\Hitesh\Documents\pipeline
uvicorn app.main:app --reload --port 8000
```

**You should see:**
```
✅ MongoDB connection successful
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**If you see MongoDB connection error:**
- Make sure MongoDB is running
- Check if the connection string is correct in `app/db/mongo.py`

### Step 3: Test Backend Directly

**Open in browser:** `http://localhost:8000/sessions`

**Expected result:** JSON array with your sessions (or empty array `[]`)

**If you get an error:**
- Check the backend terminal for error messages
- Make sure all Python dependencies are installed

### Step 4: Test Frontend

**Start frontend:**
```bash
cd C:\Users\Hitesh\Documents\pipeline\frontend
npm run dev
```

**Open:** `http://localhost:5173`

**Expected result:** Dashboard should load without CORS errors

## Common Issues

### Issue: "MongoDB connection failed"
**Solution:** Start MongoDB service
```bash
net start MongoDB
```

### Issue: "CORS policy" error
**Solution:** Backend CORS is configured, but ensure backend is running with the updated code

### Issue: "500 Internal Server Error"
**Solution:** Check backend logs - likely MongoDB connection issue

### Issue: Port 8000 already in use
**Solution:** Kill the process using port 8000, or use a different port
```bash
# Find process using port 8000
netstat -ano | findstr :8000
# Kill the process (replace XXXX with PID)
taskkill /PID XXXX /F
```

## Quick Verification

Run this Python script to test everything:

```python
import requests

# Test backend
try:
    r = requests.get('http://localhost:8000/sessions')
    print(f"Backend: ✅ Status {r.status_code}")
    print(f"Response: {r.text[:200]}...")
except Exception as e:
    print(f"Backend: ❌ {e}")

# Test CORS (should work if backend is running)
print("If backend works, CORS should work in browser")
```

## Final Working Setup

**Terminal 1 (Backend):**
```bash
cd C:\Users\Hitesh\Documents\pipeline
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd C:\Users\Hitesh\Documents\pipeline\frontend
npm run dev
```

**Browser:** `http://localhost:5173`

Both services should be running simultaneously!
