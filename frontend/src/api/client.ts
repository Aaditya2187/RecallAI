import { API_BASE_URL } from '../utils/constants';
import type { Session, SessionDetail, UploadResponse, AskResponse, ApiError } from '../types/api';

// Helper for FormData requests
async function postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    // DO NOT set Content-Type header - browser sets it automatically with boundary
  });
  
  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      const errorData: ApiError = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If response is not JSON, use default error message
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// Helper for JSON requests
async function getJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      const errorData: ApiError = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If response is not JSON, use default error message
    }
    throw new Error(errorMessage);
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
    
    return postFormData<UploadResponse>('/ingest_audio', formData);
  },

  // POST /ask
  // ⚠️ CRITICAL: Backend expects application/x-www-form-urlencoded or multipart/form-data
  // Field name MUST be "query", not JSON body
  askQuestion: async (query: string, topK: number = 5): Promise<AskResponse> => {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('top_k', topK.toString());
    
    return postFormData<AskResponse>('/ask', formData);
  },
};

