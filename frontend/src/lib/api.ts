import { getDeviceId } from './utils';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const deviceId = getDeviceId();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...init.headers,
    },
  });

  const body: ApiResponse<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.error?.message ?? `Request failed: ${res.status}`);
  }

  return body.data as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, data: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
