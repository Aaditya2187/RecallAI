import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { SessionDetail } from '../types/api';

export function useSession(sessionId: string) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getSession(sessionId)
      .then(setSession)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch session'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return { session, loading, error };
}

