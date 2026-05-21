// Session list item (from GET /sessions)
export interface Session {
  id: string;
  session_id?: string;
  created_at: string;
  title?: string;
  display_title?: string;
  session_type?: string;
  tags?: string[];
  summary?: string;
  audio_filename?: string;
}

// Session detail (from GET /sessions/{id})
export interface SessionDetail extends Session {
  // May include additional fields like:
  transcript?: string;
  metadata?: Record<string, any>;
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
    session_title?: string;
    chunk_text: string;
    score?: number;
    speaker?: string;
    start?: number;
  }>;
  // Add other fields as returned by backend
}

// Error response (standardized)
export interface ApiError {
  detail: string;
  // May include other error fields
}

