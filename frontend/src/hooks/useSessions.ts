import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Session } from '../types/api';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getSessions()
      .then(setSessions)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch sessions'))
      .finally(() => setLoading(false));
  }, []);

  return { sessions, loading, error };
}

