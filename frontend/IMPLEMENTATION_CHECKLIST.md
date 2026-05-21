# Frontend Implementation Checklist

## Pre-Implementation Backend Verification

### ✅ Backend Requirements (Must Complete First)

- [ ] **CORS Enabled**: Verify `app/main.py` has CORS middleware configured
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], ...)
  ```

- [ ] **Session APIs Exist**: Verify these endpoints are registered:
  - [ ] `GET /sessions` → Returns list of sessions
  - [ ] `GET /sessions/{session_id}` → Returns single session detail

- [ ] **Test Endpoints**: Use Postman/curl to verify:
  - [ ] `GET http://localhost:8000/sessions` returns JSON array
  - [ ] `GET http://localhost:8000/sessions/{id}` returns JSON object
  - [ ] `POST http://localhost:8000/ingest_audio` accepts multipart/form-data with field "file"
  - [ ] `POST http://localhost:8000/ask` accepts FormData with field "query"

---

## Frontend Implementation Order

### Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies: `react-router-dom`, `tailwindcss`
- [ ] Configure Tailwind CSS
- [ ] Set up TypeScript strict mode
- [ ] Create `.env` file with `VITE_API_BASE_URL`

### Phase 2: Core Infrastructure
- [ ] Create `src/utils/constants.ts` with API base URL
- [ ] Create `src/types/api.ts` with all TypeScript interfaces
- [ ] Create `src/api/client.ts` with all API functions
  - [ ] Verify `uploadAudio` uses FormData with field name "file"
  - [ ] Verify `askQuestion` uses FormData with field name "query"
  - [ ] Add proper error handling

### Phase 3: Custom Hooks
- [ ] Implement `src/hooks/useSessions.ts`
- [ ] Implement `src/hooks/useSession.ts`
- [ ] Implement `src/hooks/useAudioUpload.ts`
- [ ] Implement `src/hooks/useChat.ts`

### Phase 4: Components
- [ ] Create common components (`Button.tsx`, `Input.tsx`, `LoadingSpinner.tsx`)
- [ ] Implement `Dashboard.tsx` (session list)
- [ ] Implement `SessionDetail.tsx` (single session view)
- [ ] Implement `AudioUpload.tsx` (upload form)
- [ ] Implement `Chat.tsx` (Q&A interface)

### Phase 5: Routing & App Structure
- [ ] Set up React Router in `App.tsx`
- [ ] Configure all routes:
  - [ ] `/` → Dashboard
  - [ ] `/sessions/:id` → SessionDetail
  - [ ] `/upload` → AudioUpload
  - [ ] `/chat` → Chat
- [ ] Add navigation between pages

### Phase 6: Styling & UX
- [ ] Apply Tailwind CSS styling to all components
- [ ] Add loading states (spinners, disabled buttons)
- [ ] Add error messages and user feedback
- [ ] Handle empty states ("No sessions", "No summary available")
- [ ] Make responsive (mobile-friendly)

### Phase 7: Testing & Polish
- [ ] Test all API calls work correctly
- [ ] Verify FormData is sent correctly (check Network tab)
- [ ] Test error handling (disconnect backend, test error states)
- [ ] Test navigation between pages
- [ ] Verify CORS works (no CORS errors in console)
- [ ] Test on different browsers

---

## Critical Implementation Details

### ⚠️ FormData for Audio Upload
```typescript
// CORRECT ✅
const formData = new FormData();
formData.append('file', file); // Field name MUST be "file"
// DO NOT set Content-Type header manually

// WRONG ❌
fetch('/ingest_audio', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ file: ... })
});
```

### ⚠️ FormData for Ask Endpoint
```typescript
// CORRECT ✅
const formData = new FormData();
formData.append('query', question);
formData.append('top_k', '5');
// Backend expects FormData, not JSON

// WRONG ❌
fetch('/ask', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: question })
});
```

### ⚠️ CORS Configuration
- Backend MUST have CORS middleware enabled
- Frontend runs on `http://localhost:5173` (Vite default)
- Backend should allow this origin

---

## Verification Steps

### 1. API Client Verification
```bash
# In browser console after implementing apiClient:
await apiClient.getSessions()  // Should return array
await apiClient.getSession('test-id')  // Should return object
```

### 2. Network Tab Verification
- Open DevTools → Network tab
- Upload audio file → Check request:
  - [ ] Method: POST
  - [ ] URL: `/ingest_audio`
  - [ ] Content-Type: `multipart/form-data; boundary=...`
  - [ ] Form Data shows `file: [audio file]`
- Ask question → Check request:
  - [ ] Method: POST
  - [ ] URL: `/ask`
  - [ ] Content-Type: `multipart/form-data; boundary=...`
  - [ ] Form Data shows `query: "your question"`

### 3. CORS Verification
- [ ] No CORS errors in browser console
- [ ] Requests succeed (status 200)
- [ ] Responses contain expected data

---

## Common Pitfalls to Avoid

1. ❌ **Sending JSON to `/ask`** → Backend expects FormData
2. ❌ **Wrong field name for upload** → Must be "file", not "audio" or "upload"
3. ❌ **Setting Content-Type manually for FormData** → Browser sets it automatically
4. ❌ **Forgetting CORS** → Requests will fail with CORS error
5. ❌ **Not handling missing summary** → Show "No summary available yet"
6. ❌ **Not handling errors** → Always catch and display errors to user

---

## Success Criteria

✅ All API endpoints work correctly  
✅ No CORS errors  
✅ FormData sent correctly (verify in Network tab)  
✅ All components render without errors  
✅ Navigation works between all pages  
✅ Loading states show during API calls  
✅ Error messages display when API calls fail  
✅ Empty states handled gracefully  
✅ Responsive design works on mobile  

---

## Next Steps After Implementation

1. Add error boundaries for better error handling
2. Implement optimistic UI updates
3. Add pagination if session list grows large
4. Add search/filter functionality
5. Consider WebSocket for real-time updates
6. Add unit tests for hooks and components
7. Add E2E tests with Playwright/Cypress

