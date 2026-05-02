import type { AppUser, AuthResponse } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (typeof window !== 'undefined' 
    ? `${window.location.origin}/api` 
    : 'http://localhost:8000/api');

export function readCurrentUser(): AppUser | null {
  if (typeof window === 'undefined') return null;

  const user = localStorage.getItem('user');
  if (!user) return null;

  try {
    return JSON.parse(user) as AppUser;
  } catch {
    return null;
  }
}

export function writeAuthSession(auth: AuthResponse) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', auth.access);
    localStorage.setItem('refresh_token', auth.refresh);
    localStorage.setItem('user', JSON.stringify(auth.user));
    // Set cookie for middleware to read
    document.cookie = `user=${JSON.stringify(auth.user)}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    // Clear cookie
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token');
  }

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      clearAuthSession();
      window.location.href = '/auth/login';
    }
  }

  if (response.status === 403) {
    if (typeof window !== 'undefined') {
      const user = readCurrentUser();
      if (user) {
        window.location.href = user.role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/user';
      } else {
        window.location.href = '/auth/login';
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || errorData?.detail || errorData?.error || `API Error: ${response.statusText}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  
  if (response.status === 204) return null as T;
  
  return response.json() as Promise<T>;
}
