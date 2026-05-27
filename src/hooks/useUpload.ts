'use client';

import { useState, useCallback } from 'react';
import { supabase, STORAGE_BUCKET, TABLE_NAME } from '@/lib/supabase';
import { generateReferenceId, getStoragePath } from '@/lib/utils';
import { UploadFormData } from '@/lib/types';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function useUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (formData: UploadFormData, uploadedBy: string): Promise<string[] | null> => {
      setStatus('uploading');
      setError(null);
      setProgress(0);

      const referenceId = generateReferenceId();
      const uploadedPaths: string[] = [];

      try {
        for (let i = 0; i < formData.files.length; i++) {
          const file = formData.files[i];
          const storagePath = getStoragePath(
            formData.email,
            formData.clientName,
            formData.recordYear,
            file.name
          );

          const { error: storageError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, { upsert: false });

          if (storageError) throw new Error(`Storage error: ${storageError.message}`);

          const { error: dbError } = await supabase.from(TABLE_NAME).insert({
            reference_id: referenceId,
            client_name: formData.clientName.trim(),
            record_year: formData.recordYear,
            user_name: formData.userName,
            email: formData.email.toLowerCase(),
            file_name: file.name,
            storage_path: storagePath,
            notes: formData.notes || null,
            uploaded_by: uploadedBy,
            file_size: file.size,
            file_type: file.type,
          });

          if (dbError) throw new Error(`Database error: ${dbError.message}`);

          uploadedPaths.push(storagePath);
          setProgress(Math.round(((i + 1) / formData.files.length) * 100));
        }

        setStatus('success');
        return uploadedPaths;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setError(msg);
        setStatus('error');
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { status, progress, error, uploadFiles, reset };
}
