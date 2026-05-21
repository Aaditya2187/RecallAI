# Frontend Implementation Plan
## React + TypeScript + Tailwind CSS

**Status**: ✅ Architecturally sound and compatible with FastAPI + MongoDB + Chroma backend

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [API Client Contract](#api-client-contract)
4. [Type Definitions](#type-definitions)
5. [Component Structure](#component-structure)
6. [Routing Plan](#routing-plan)
7. [Data Flow](#data-flow)
8. [Backend Requirements Checklist](#backend-requirements-checklist)
9. [Implementation Notes](#implementation-notes)

---

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Fetch API (native) or axios
- **State Management**: React hooks (useState, useEffect, custom hooks)
- **Build Tool**: Vite

### Design Principles
- ✅ Strict separation: API client → Types → Components → Hooks
- ✅ No direct Chroma/embedding coupling (backend handles this)
- ✅ Precomputed summaries for dashboard (no semantic search for listing)
- ✅ Sessions as first-class entities
- ✅ TypeScript strict mode enabled

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts              # API client (all HTTP calls)
│   ├── types/
│   │   └── api.ts                 # TypeScript types matching backend
│   ├── components/
│   │   ├── Dashboard.tsx          # Session list view
│   │   ├── SessionDetail.tsx      # Individual session view
│   │   ├── AudioUpload.tsx        # Upload form component
│   │   ├── Chat.tsx               # Q&A chat interface
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useSessions.ts         # Fetch sessions list
│   │   ├── useSession.ts          # Fetch single session
│   │   ├── useAudioUpload.ts      # Handle audio upload
│   │   └── useChat.ts             # Handle Q&A chat
│   ├── utils/
│   │   └── constants.ts           # API base URL, endpoints
│   ├── App.tsx                    # Main app component with routing
│   └── main.tsx                   # Entry point
├── public/
├── package.json
├── tsconfig.json                  # Strict TypeScript config
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🔌 API Client Contract

### File: `src/api/client.ts`

**Critical**: All endpoints must match backend contract exactly.

```typescript
// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper for FormData requests
async function postFormData(endpoint: string, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    // DO NOT set Content-Type header - browser sets it automatically with boundary
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Helper for JSON requests
async function getJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// API Client Functions
export const apiClient = {
  // GET /sessions
  getSessions: (): Promise<Session[]> => {
    return getJson<Session[]>('/sessions');
  },

  // GET /sessions/{session_id}
  getSession: (sessionId: string): Promise<SessionDetail> => {
    return getJson<SessionDetail>(`/sessions/${sessionId}`);
  },

  // POST /ingest_audio
  // ⚠️ CRITICAL: Must use multipart/form-data with field name "file"
  uploadAudio: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file); // Field name MUST be "file"
    
    return postFormData('/ingest_audio', formData);
  },

  // POST /ask
  // ⚠️ CRITICAL: Backend expects application/x-www-form-urlencoded or multipart/form-data
  // Field name MUST be "query", not JSON body
  askQuestion: async (query: string, topK: number = 5): Promise<AskResponse> => {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('top_k', topK.toString());
    
    return postFormData('/ask', formData);
  },
};
```

**Key Points**:
- ✅ Audio upload: `multipart/form-data`, field name `file`
- ✅ Ask endpoint: `FormData` with field `query` (not JSON)
- ✅ Sessions endpoints: Standard JSON GET requests
- ✅ Error handling: Throw errors for non-OK responses

---

## 📝 Type Definitions

### File: `src/types/api.ts`

```typescript
// Session list item (from GET /sessions)
export interface Session {
  id: string;
  created_at: string; // ISO 8601 datetime
  summary?: string;  // Optional - may not exist yet
  audio_filename?: string;
  // Add other fields as returned by backend
}

// Session detail (from GET /sessions/{id})
export interface SessionDetail extends Session {
  // May include additional fields like:
  // transcript?: string;
  // metadata?: Record<string, any>;
}

// Upload response (from POST /ingest_audio)
export interface UploadResponse {
  session_id: string;
  message: string;
  // Add other fields as returned by backend
}

// Ask response (from POST /ask)
export interface AskResponse {
  answer: string;
  sources?: Array<{
    session_id: string;
    chunk_text: string;
    score?: number;
  }>;
  // Add other fields as returned by backend
}

// Error response (standardized)
export interface ApiError {
  detail: string;
  // May include other error fields
}
```

**Note**: Types should match FastAPI response models exactly. Update as backend evolves.

---

## 🧩 Component Structure

### Dashboard (`src/components/Dashboard.tsx`)
- Lists all sessions from `GET /sessions`
- Shows session ID, creation date, summary (if available)
- Click session → navigate to `/sessions/:id`
- Uses `useSessions` hook
- Displays "No summary available yet" if summary is missing

### Session Detail (`src/components/SessionDetail.tsx`)
- Fetches single session via `GET /sessions/{id}`
- Uses `useSession(id)` hook
- Displays full session information
- Shows summary, transcript (if available), metadata

### Audio Upload (`src/components/AudioUpload.tsx`)
- File input for audio files
- Uses `useAudioUpload` hook
- Shows upload progress/status
- On success: navigate to new session detail page
- Handles errors gracefully

### Chat (`src/components/Chat.tsx`)
- Input field for questions
- Uses `useChat` hook
- Displays conversation history
- Shows loading state during API call
- Displays answer and sources (if available)

---

## 🪝 Custom Hooks

### `src/hooks/useSessions.ts`
```typescript
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getSessions()
      .then(setSessions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { sessions, loading, error };
}
```

### `src/hooks/useSession.ts`
```typescript
export function useSession(sessionId: string) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getSession(sessionId)
      .then(setSession)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return { session, loading, error };
}
```

### `src/hooks/useAudioUpload.ts`
```typescript
export function useAudioUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      const response = await apiClient.uploadAudio(file);
      return response; // Contains session_id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
```

### `src/hooks/useChat.ts`
```typescript
export function useChat() {
  const [messages, setMessages] = useState<Array<{ question: string; answer: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (question: string, topK: number = 5) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.askQuestion(question, topK);
      setMessages(prev => [...prev, { question, answer: response.answer }]);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { messages, ask, loading, error };
}
```

---

## 🗺️ Routing Plan

### File: `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SessionDetail from './components/SessionDetail';
import AudioUpload from './components/AudioUpload';
import Chat from './components/Chat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="/upload" element={<AudioUpload />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Route Mapping**:
- `/` → Dashboard (lists all sessions)
- `/sessions/:id` → Session detail (single session view)
- `/upload` → Audio upload form
- `/chat` → Q&A chat interface

---

## 🔄 Data Flow

```
User Action
    ↓
React Component
    ↓
Custom Hook (useSessions, useChat, etc.)
    ↓
API Client (apiClient.getSessions, apiClient.askQuestion)
    ↓
HTTP Request (Fetch API)
    ↓
FastAPI Backend
    ↓
MongoDB (sessions) / Chroma (embeddings - internal only)
    ↓
HTTP Response
    ↓
API Client (parse JSON)
    ↓
Custom Hook (update state)
    ↓
React Component (re-render)
    ↓
User sees updated UI
```

**Key Points**:
- ✅ Frontend never touches Chroma directly
- ✅ Frontend never handles embeddings
- ✅ All semantic search happens in backend `/ask` endpoint
- ✅ Dashboard uses precomputed summaries from MongoDB

---

## ✅ Backend Requirements Checklist

Before implementing frontend, ensure backend has:

### 1. Session Read APIs Exist
- [ ] `GET /sessions` endpoint exists in `app/sessions/api.py`
- [ ] `GET /sessions/{session_id}` endpoint exists
- [ ] Both endpoints registered in `app/main.py`

### 2. CORS Enabled
**MANDATORY** - Add to `app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",   # Alternative dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. `/ask` Payload Format Alignment
**Choose one approach**:

**Option A**: Keep backend as-is (FormData)
- Frontend sends FormData ✅ (already planned)
- No backend changes needed

**Option B**: Update backend to accept JSON (recommended)
- Backend change:
```python
from pydantic import BaseModel

class AskRequest(BaseModel):
    query: str
    top_k: int = 5

@app.post("/ask")
def ask(req: AskRequest):  # Accepts JSON body
    ...
```
- Frontend can then send JSON (simpler)

**Current Plan**: Uses Option A (FormData) - compatible with existing backend.

---

## 📌 Implementation Notes

### Environment Variables
Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```

### Error Handling
- All API calls should handle network errors
- Display user-friendly error messages
- Log errors to console in development

### Loading States
- Show loading spinners during API calls
- Disable buttons during upload/chat requests
- Provide visual feedback for all async operations

### Type Safety
- Enable TypeScript strict mode
- Match types exactly to backend response models
- Update types when backend changes

### Testing Considerations
- Mock API client for component tests
- Test hooks independently
- Test FormData construction for upload/ask endpoints

### Future Enhancements
- WebSocket support for real-time updates (if needed)
- Optimistic UI updates
- Pagination for sessions list (if many sessions)
- Search/filter on dashboard
- Audio playback in session detail

---

## 🚀 Getting Started

1. **Initialize project**:
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   ```

2. **Install dependencies**:
   ```bash
   npm install react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Verify backend**:
   - Ensure CORS is enabled
   - Test endpoints with Postman/curl
   - Verify `/sessions` and `/sessions/{id}` exist

4. **Start development**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📚 Summary

This plan is:
- ✅ Architecturally sound
- ✅ Industry-standard (React + TS + Tailwind)
- ✅ Correctly separated (API client, types, components, hooks)
- ✅ Fully compatible with FastAPI + MongoDB + Chroma backend
- ✅ Respects backend contract (FormData for upload/ask, JSON for sessions)
- ✅ Ready for implementation

**Next Steps**: Implement components following this structure, ensuring API client matches backend contract exactly.

