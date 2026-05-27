'use client';

import { useState, useCallback } from 'react';
import { supabase, STORAGE_BUCKET, TABLE_NAME } from '@/lib/supabase';
import { FileRecord, SearchParams } from '@/lib/types';

export function useFiles() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFiles = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(TABLE_NAME).select('*').order('uploaded_at', { ascending: false });

      if (params.clientName) {
        query = query.ilike('client_name', `%${params.clientName}%`);
      }
      if (params.email) {
        query = query.ilike('email', `%${params.email}%`);
      }
      if (params.userName) {
        query = query.ilike('user_name', `%${params.userName}%`);
      }
      if (params.referenceId) {
        query = query.ilike('reference_id', `%${params.referenceId}%`);
      }

      const currentYear = new Date().getFullYear();
      if (params.lastNYears && params.lastNYears > 0) {
        const fromYear = currentYear - params.lastNYears + 1;
        query = query.gte('record_year', fromYear).lte('record_year', currentYear);
      }
      if (typeof params.fromYear === 'number') {
        query = query.gte('record_year', params.fromYear);
      }
      if (typeof params.toYear === 'number') {
        query = query.lte('record_year', params.toYear);
      }

      const { data, error: queryError } = await query.limit(50);
      if (queryError) throw queryError;

      setFiles(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecent = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(limit);
      if (queryError) throw queryError;
      setFiles(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const getDownloadUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 3600);
    return data?.signedUrl ?? null;
  }, []);

  return { files, loading, error, searchFiles, fetchRecent, getDownloadUrl };
}
