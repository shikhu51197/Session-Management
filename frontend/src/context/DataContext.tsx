'use client';

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

interface DataContextType {
  fetchData: <T,>(key: string, fetcher: (signal: AbortSignal) => Promise<T>) => Promise<T>;
  getCachedData: (key: string) => any;
  isLoading: (key: string) => boolean;
  invalidateKey: (key: string) => void;
  version: Record<string, number>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const cache = useRef<Record<string, any>>({});
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});
  const [version, setVersion] = useState<Record<string, number>>({});
  const pendingRequests = useRef<Record<string, Promise<any>>>({});
  const abortControllers = useRef<Record<string, AbortController>>({});

  const fetchData = useCallback(async <T,>(key: string, fetcher: (signal: AbortSignal) => Promise<T>): Promise<T> => {
    // Return existing pending request if any (deduplication)
    if (pendingRequests.current[key]) {
      return pendingRequests.current[key];
    }

    // Cancel previous request for the same key if it exists
    if (abortControllers.current[key]) {
      abortControllers.current[key].abort();
    }

    const controller = new AbortController();
    abortControllers.current[key] = controller;

    const request = (async () => {
      setLoadingKeys((prev) => ({ ...prev, [key]: true }));
      try {
        const result = await fetcher(controller.signal);
        cache.current[key] = result;
        return result;
      } finally {
        delete pendingRequests.current[key];
        setLoadingKeys((prev) => ({ ...prev, [key]: false }));
      }
    })();

    pendingRequests.current[key] = request;
    return request;
  }, []);

  const getCachedData = useCallback((key: string) => cache.current[key], []);
  const isLoading = useCallback((key: string) => !!loadingKeys[key], [loadingKeys]);

  const invalidateKey = useCallback((keyPrefix: string) => {
    // Clear all keys that start with the prefix
    Object.keys(cache.current).forEach(k => {
      if (k.startsWith(keyPrefix)) {
        delete cache.current[k];
        setVersion(prev => ({ ...prev, [k]: (prev[k] || 0) + 1 }));
      }
    });
  }, []);

  return (
    <DataContext.Provider value={{ fetchData, getCachedData, isLoading, invalidateKey, version }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
