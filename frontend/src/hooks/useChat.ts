import { useState } from 'react';
import { apiClient } from '../api/client';
import type { AskResponse } from '../types/api';

export interface ChatMessage {
  question: string;
  answer: string;
  sources?: AskResponse['sources'];
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (question: string, topK: number = 5): Promise<AskResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.askQuestion(question, topK);
      setMessages(prev => [...prev, { 
        question, 
        answer: response.answer,
        sources: response.sources 
      }]);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get answer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { messages, ask, loading, error };
}

