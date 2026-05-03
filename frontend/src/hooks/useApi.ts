'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '@/lib/api';
import { useDataContext } from '@/context/DataContext';
import type { Session, Booking } from '@/lib/types';

// Generic hook for queries
function useQuery<T>(key: string, fetcher: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const { fetchData, getCachedData, isLoading, version } = useDataContext();
  const [data, setData] = useState<T | undefined>(getCachedData(key));
  const [error, setError] = useState<Error | null>(null);
  const currentVersion = version[key] || 0;

  const load = useCallback(async () => {
    try {
      const result = await fetchData(key, fetcher);
      setData(result);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setError(e);
      }
    }
  }, [key, fetchData, fetcher]);

  useEffect(() => {
    if (enabled) {
      load();
    }
  }, [load, enabled, currentVersion]);

  return {
    data,
    isLoading: isLoading(key) && !data,
    isFetching: isLoading(key),
    error,
    refetch: load
  };
}

// Sessions hooks
export function useSessions(page: number, searchQuery: string = '') {
  const fetcher = useCallback((signal: AbortSignal) => {
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    queryParams.append('page', page.toString());
    return fetchAPI<{ results: Session[]; count: number }>(
      `/bookings/sessions/?${queryParams.toString()}`,
      { signal }
    );
  }, [page, searchQuery]);

  return useQuery(['sessions', page, searchQuery].join('-'), fetcher);
}

export function useSession(id: string) {
  const fetcher = useCallback((signal: AbortSignal) => 
    fetchAPI<Session>(`/bookings/sessions/${id}/`, { signal }), [id]);

  return useQuery(`session-${id}`, fetcher, !!id);
}

// Bookings hooks
export function useBookings(page: number) {
  const fetcher = useCallback((signal: AbortSignal) => 
    fetchAPI<{ results: Booking[]; count: number }>(`/bookings/bookings/?page=${page}`, { signal }), [page]);

  return useQuery(`bookings-${page}`, fetcher);
}

export function useStats() {
  const fetcher = useCallback((signal: AbortSignal) => 
    fetchAPI<{ total_successful: number; total_pending: number }>('/bookings/stats/', { signal }), []);

  return useQuery('stats', fetcher);
}

// Mutations
export function useSessionMutation() {
  const { invalidateKey } = useDataContext();
  const [isPending, setIsPending] = useState(false);

  const mutate = async ({ id, data }: { id?: string; data: FormData }, options: { onSuccess?: () => void, onError?: (e: any) => void }) => {
    setIsPending(true);
    try {
      const method = id ? 'PATCH' : 'POST';
      const endpoint = id ? `/bookings/sessions/${id}/` : '/bookings/sessions/';
      await fetchAPI<Session>(endpoint, { method, body: data });
      invalidateKey('sessions'); // Refresh lists
      if (id) invalidateKey(`session-${id}`); // Refresh detail
      options.onSuccess?.();
    } catch (e) {
      options.onError?.(e);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

export function useDeleteSession() {
  const { invalidateKey } = useDataContext();
  const [isPending, setIsPending] = useState(false);

  const mutate = async (id: string, options: { onSuccess?: () => void, onError?: (e: any) => void }) => {
    setIsPending(true);
    try {
      await fetchAPI<null>(`/bookings/sessions/${id}/`, { method: 'DELETE' });
      invalidateKey('sessions');
      invalidateKey(`session-${id}`);
      options.onSuccess?.();
    } catch (e) {
      options.onError?.(e);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
