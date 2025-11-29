'use client';

import { useState, useCallback } from 'react';
import { UploadUrlRequest, UploadUrlResponse } from '@/types/gym';
import { problemService } from '@/services/problem.service';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const getUploadUrl = useCallback(async (data: UploadUrlRequest): Promise<UploadUrlResponse> => {
    setError(null);
    try {
      return await problemService.getUploadUrl(data);
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error('Failed to get upload URL');
      setError(uploadError);
      throw uploadError;
    }
  }, []);

  const uploadFile = useCallback(async (uploadUrl: string, file: File): Promise<void> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        setIsUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          resolve();
        } else {
          const uploadError = new Error(`Upload failed with status ${xhr.status}`);
          setError(uploadError);
          reject(uploadError);
        }
      });

      xhr.addEventListener('error', () => {
        setIsUploading(false);
        const uploadError = new Error('Upload failed');
        setError(uploadError);
        reject(uploadError);
      });

      xhr.addEventListener('abort', () => {
        setIsUploading(false);
        const uploadError = new Error('Upload aborted');
        setError(uploadError);
        reject(uploadError);
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }, []);

  return { getUploadUrl, uploadFile, isUploading, progress, error };
}
