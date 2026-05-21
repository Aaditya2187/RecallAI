# API Contract Reference
## Frontend ↔ Backend Contract

This document defines the exact contract between frontend and backend. **Follow this exactly** to avoid integration issues.

---

## Base URL

```
Development: http://localhost:8000
Production: [Set via VITE_API_BASE_URL environment variable]
```

---

## Endpoints

### 1. GET /sessions

**Purpose**: Retrieve list of all sessions

**Request**:
```
GET /sessions
Headers: None required
Body: None
```

**Response** (200 OK):
```json
[
  {
    "id": "session_123",
    "created_at": "2024-01-15T10:30:00Z",
    "summary": "Meeting about project planning...",
    "audio_filename": "meeting_20240115.mp3"
  },
  {
    "id": "session_456",
    "created_at": "2024-01-14T14:20:00Z",
    "summary": null,
    "audio_filename": "call_20240114.mp3"
  }
]
```

**Frontend Implementation**:
```typescript
const response = await fetch(`${API_BASE_URL}/sessions`);
const sessions: Session[] = await response.json();
```

**Notes**:
- ✅ Returns JSON array
- ✅ `summary` may be `null` or missing (handle gracefully)
- ✅ No authentication required (for now)

---

### 2. GET /sessions/{session_id}

**Purpose**: Retrieve detailed information about a specific session

**Request**:
```
GET /sessions/{session_id}
Headers: None required
Body: None
```

**Response** (200 OK):
```json
{
  "id": "session_123",
  "created_at": "2024-01-15T10:30:00Z",
  "summary": "Meeting about project planning...",
  "audio_filename": "meeting_20240115.mp3",
  "transcript": "Full transcript text here...",
  "metadata": {
    "duration": 3600,
    "speaker_count": 2
  }
}
```

**Frontend Implementation**:
```typescript
const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
const session: SessionDetail = await response.json();
```

**Error Response** (404 Not Found):
```json
{
  "detail": "Session not found"
}
```

**Notes**:
- ✅ Returns JSON object
- ✅ Additional fields may be present (transcript, metadata, etc.)
- ✅ Handle 404 errors gracefully

---

### 3. POST /ingest_audio

**Purpose**: Upload an audio file for processing

**Request**:
```
POST /ingest_audio
Content-Type: multipart/form-data
Body: FormData with field "file"
```

**⚠️ CRITICAL**: Must use `multipart/form-data` with field name **`file`**

**Frontend Implementation**:
```typescript
const formData = new FormData();
formData.append('file', audioFile); // Field name MUST be "file"

const response = await fetch(`${API_BASE_URL}/ingest_audio`, {
  method: 'POST',
  body: formData,
  // DO NOT set Content-Type header - browser sets it automatically
});

const result: UploadResponse = await response.json();
```

**Correct Request Example** (as seen in Network tab):
```
POST /ingest_audio HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="audio.mp3"
Content-Type: audio/mpeg

[binary audio data]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Response** (200 OK):
```json
{
  "session_id": "session_789",
  "message": "Audio uploaded successfully"
}
```

**Error Responses**:
- 400 Bad Request: Invalid file format or missing file
- 500 Internal Server Error: Processing failed

**Notes**:
- ✅ Field name MUST be `"file"` (not "audio", "upload", etc.)
- ✅ DO NOT manually set `Content-Type` header
- ✅ Browser automatically sets `Content-Type: multipart/form-data; boundary=...`
- ✅ Accepts common audio formats (mp3, wav, m4a, etc.)

---

### 4. POST /ask

**Purpose**: Ask a question and get an answer using semantic search

**Request**:
```
POST /ask
Content-Type: application/x-www-form-urlencoded OR multipart/form-data
Body: FormData with fields "query" and "top_k"
```

**⚠️ CRITICAL**: Backend expects FormData, **NOT JSON**

**Frontend Implementation**:
```typescript
const formData = new FormData();
formData.append('query', question); // Field name MUST be "query"
formData.append('top_k', '5'); // Optional, defaults to 5

const response = await fetch(`${API_BASE_URL}/ask`, {
  method: 'POST',
  body: formData,
  // DO NOT set Content-Type header - browser sets it automatically
});

const result: AskResponse = await response.json();
```

**Correct Request Example** (as seen in Network tab):
```
POST /ask HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="query"

What was discussed in the meeting?
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="top_k"

5
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Response** (200 OK):
```json
{
  "answer": "The meeting discussed project planning, timeline, and resource allocation.",
  "sources": [
    {
      "session_id": "session_123",
      "chunk_text": "We need to plan the project timeline...",
      "score": 0.95
    },
    {
      "session_id": "session_456",
      "chunk_text": "Resource allocation is critical...",
      "score": 0.87
    }
  ]
}
```

**Error Responses**:
- 400 Bad Request: Missing or invalid query
- 500 Internal Server Error: Search/LLM processing failed

**Notes**:
- ✅ Field name MUST be `"query"` (not "question", "text", etc.)
- ✅ `top_k` is optional (defaults to 5)
- ✅ DO NOT send JSON body: `{ "query": "..." }` ❌
- ✅ DO send FormData: `formData.append('query', '...')` ✅
- ✅ Backend uses Chroma for semantic search (frontend doesn't need to know this)

---

## Error Handling

### Standard Error Response Format

All endpoints may return errors in this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Request succeeded
- `400 Bad Request`: Invalid request (missing fields, wrong format)
- `404 Not Found`: Resource not found (e.g., session_id doesn't exist)
- `500 Internal Server Error`: Server-side error

### Frontend Error Handling

```typescript
try {
  const response = await fetch(`${API_BASE_URL}/endpoint`);
  
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  // Handle network errors, JSON parse errors, etc.
  console.error('API call failed:', error);
  throw error;
}
```

---

## CORS Requirements

**Backend MUST have CORS enabled** for frontend to work.

### Backend Configuration (FastAPI)

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default port
        "http://localhost:3000",  # Alternative dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend Configuration

No special configuration needed. Browser handles CORS automatically.

**If CORS is not enabled**, you'll see errors like:
```
Access to fetch at 'http://localhost:8000/sessions' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...
```

---

## Testing the Contract

### Using curl

```bash
# Test GET /sessions
curl http://localhost:8000/sessions

# Test GET /sessions/{id}
curl http://localhost:8000/sessions/session_123

# Test POST /ingest_audio
curl -X POST http://localhost:8000/ingest_audio \
  -F "file=@audio.mp3"

# Test POST /ask
curl -X POST http://localhost:8000/ask \
  -F "query=What was discussed?" \
  -F "top_k=5"
```

### Using Postman

1. **GET /sessions**: 
   - Method: GET
   - URL: `http://localhost:8000/sessions`
   - No headers or body needed

2. **POST /ingest_audio**:
   - Method: POST
   - URL: `http://localhost:8000/ingest_audio`
   - Body → form-data
   - Key: `file` (type: File)
   - Value: Select audio file

3. **POST /ask**:
   - Method: POST
   - URL: `http://localhost:8000/ask`
   - Body → form-data
   - Key: `query` (type: Text)
   - Value: `What was discussed?`
   - Key: `top_k` (type: Text, optional)
   - Value: `5`

---

## Summary Checklist

Before implementing frontend, verify:

- [ ] Backend has CORS enabled
- [ ] `GET /sessions` returns JSON array
- [ ] `GET /sessions/{id}` returns JSON object
- [ ] `POST /ingest_audio` accepts `multipart/form-data` with field `file`
- [ ] `POST /ask` accepts FormData with field `query` (not JSON)
- [ ] All endpoints return proper error responses

**If any of these fail, fix backend first before implementing frontend.**

