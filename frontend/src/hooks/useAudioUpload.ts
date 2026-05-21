import { useState } from 'react';
import { apiClient } from '../api/client';
import type { UploadResponse } from '../types/api';

export function useAudioUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<UploadResponse> => {
    setUploading(true);
    setError(null);
    
    try {
      const response = await apiClient.uploadAudio(file);
      return response; // Contains session_id
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}

