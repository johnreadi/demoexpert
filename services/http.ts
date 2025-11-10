export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function http<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    let err: any = { status: res.status };
    try { err.body = await res.json(); } catch {}
    throw err;
  }
  try {
    return await res.json();
  } catch {
    return undefined as any;
  }
}
