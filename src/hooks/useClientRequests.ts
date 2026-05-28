'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ClientUploadRequest } from '@/lib/types';

const TABLE_NAME = 'client_upload_requests';

type ClientRequestRow = {
  id: string;
  client_name: string;
  title: string;
  details: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

function mapRequest(data: ClientRequestRow): ClientUploadRequest {
  return {
    id: data.id,
    clientName: data.client_name,
    title: data.title,
    details: data.details || '',
    createdAt: data.created_at,
    createdBy: data.created_by,
    status: (data.status || 'open') as 'open' | 'completed',
  };
}

export function useClientRequests() {
  const [requests, setRequests] = useState<ClientUploadRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async (clientName?: string) => {
    setLoading(true);
    try {
      let query = supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false });

      if (clientName) {
        query = query.ilike('client_name', `%${clientName}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setRequests((data || []).map(mapRequest));
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const refresh = useCallback(async () => {
    await fetchRequests();
  }, [fetchRequests]);

  const createRequest = useCallback(
    async (payload: Omit<ClientUploadRequest, 'id' | 'createdAt' | 'status'>) => {
      try {
        const { error } = await supabase.from(TABLE_NAME).insert({
          client_name: payload.clientName,
          title: payload.title,
          details: payload.details,
          created_by: payload.createdBy,
          status: 'open',
        });

        if (error) throw error;
        await fetchRequests();
      } catch (err) {
        console.error('Failed to create request:', err);
      }
    },
    [fetchRequests]
  );

  const markCompleted = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from(TABLE_NAME).update({ status: 'completed' }).eq('id', id);

        if (error) throw error;
        await fetchRequests();
      } catch (err) {
        console.error('Failed to update request:', err);
      }
    },
    [fetchRequests]
  );

  return { requests, loading, refresh, createRequest, markCompleted, fetchRequests };
}
