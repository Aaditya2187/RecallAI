// API base URL from environment variable or default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  SESSIONS: '/sessions',
  SESSION_DETAIL: (id: string) => `/sessions/${id}`,
  INGEST_AUDIO: '/ingest_audio',
  ASK: '/ask',
} as const;

