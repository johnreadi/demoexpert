export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_LOCAL_API = import.meta.env.MODE !== 'production' && import.meta.env.VITE_USE_LOCAL_API === 'true';

export async function http<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  if (USE_LOCAL_API) throw new Error('local_api_mode');
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
