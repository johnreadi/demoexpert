export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const HTTP_TIMEOUT_MS = Number(import.meta.env.VITE_HTTP_TIMEOUT_MS || 30000);

function sanitizeApi(data: any, path: string): any {
  const san = (node: any): any => {
    if (node === null || node === undefined) return node;
    if (Array.isArray(node)) return node.map(san);
    if (typeof node === 'object') {
      const out: any = {};
      for (const k of Object.keys(node)) {
        let v = san(node[k]);
        if (k === 'images') {
          if (Array.isArray(v)) out[k] = v.filter((x: any) => typeof x === 'string');
          else if (typeof v === 'string') out[k] = [v];
          else out[k] = [];
          continue;
        }
        out[k] = v;
      }
      if (!out.vehicle && (out.images || out.vehicleName || out.name || out.brand || out.model)) {
        const imgs = Array.isArray(out.images) ? out.images : [];
        out.vehicle = {
          name: out.vehicleName || out.name || '',
          brand: out.brand || '',
          model: out.model || '',
          year: Number(out.year || 0),
          mileage: Number(out.mileage || 0),
          description: out.description || '',
          images: imgs,
        };
      } else if (out.vehicle) {
        const v = out.vehicle;
        const imgs = Array.isArray(v.images) ? v.images : (Array.isArray(out.images) ? out.images : []);
        out.vehicle = { ...v, images: imgs };
      }
      return out;
    }
    return node;
  };
  return san(data);
}

function resolveUrl(path: string): string {
  const b = String(API_BASE_URL || '').replace(/\/+$/, '');
  const base = b.replace(/(\/api)+$/, '/api');
  const p = String(path || '').replace(/^\/+/, '');
  const normalized = p.startsWith('api/') ? p.substring(4) : p;
  return `${base}/${normalized}`;
}

function shouldRetry(status: number | undefined) {
  return status === 502 || status === 503 || status === 504;
}

function isIdempotent(method: string) {
  const m = String(method || 'GET').toUpperCase();
  return m === 'GET' || m === 'HEAD' || m === 'OPTIONS';
}

async function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function humanizeApiError(path: string, status: number, body: any): string {
  const code = String(body?.error || '').trim();
  if (code) {
    if (code === 'missing_credentials' || code === 'missing_fields') return 'Email et mot de passe requis.';
    if (code === 'invalid_credentials') return 'Email ou mot de passe incorrect.';
    if (code === 'account_pending') return 'Compte en attente de validation.';
    if (code === 'unauthorized') return 'Vous devez vous reconnecter.';
    if (code === 'database_not_configured' || code === 'database_unavailable' || code === 'database_schema_missing') {
      return 'Base de données indisponible.';
    }
    if (code === 'login_failed') return 'La connexion a échoué.';
    return code;
  }
  if (status === 401) return 'Vous devez vous reconnecter.';
  if (status === 403) return 'Accès refusé.';
  if (status === 404) return 'Ressource introuvable.';
  if (status >= 500) return 'Erreur serveur.';
  const p = String(path || '');
  return p ? `Erreur API (${p})` : 'Erreur API';
}

export async function http<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  // Production mode - make actual API calls with timeout and error handling
  const method = String(options.method || 'GET').toUpperCase();
  const maxAttempts = isIdempotent(method) ? 3 : 1;
  const url = resolveUrl(path);

  let lastErr: any = undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errBody = await res.json().catch(() => undefined);
        const message = humanizeApiError(path, res.status, errBody);
        const e: any = Object.assign(new Error(message), { status: res.status, body: errBody });
        if (attempt < maxAttempts && shouldRetry(res.status)) {
          lastErr = e;
          await sleep(250 * attempt * attempt);
          continue;
        }
        throw e;
      }

      try {
        const data = await res.json();
        return sanitizeApi(data, path);
      } catch {
        return undefined as any;
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      const aborted = error?.name === 'AbortError';
      const canRetry = attempt < maxAttempts && (aborted || shouldRetry(error?.status));
      if (canRetry) {
        lastErr = error;
        await sleep(250 * attempt * attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastErr;
}
