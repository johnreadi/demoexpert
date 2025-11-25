export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_LOCAL_API = import.meta.env.MODE !== 'production' && import.meta.env.VITE_USE_LOCAL_API === 'true';
const USE_LOCAL_STORAGE = import.meta.env.MODE !== 'production' && import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

// Local storage mock for API calls
const localStorageMock: Record<string, any> = {
  // Default data
  '/api/products': [],
  '/api/auctions': [],
  '/api/settings': {
    businessInfo: {
      name: 'Démolition Expert',
      logoUrl: '',
      address: '450 Route de Gournay, 76160 Saint-Jacques-sur-Darnétal, France',
      phone: '02 35 08 18 55',
      email: 'contact@casseautopro.fr',
      openingHours: 'Lun-Ven: 8h00 - 18h00, Sam: 9h00 - 12h00'
    },
    hero: {
      title: "Pièces d'occasion de qualité",
      subtitle: "Économisez jusqu'à 80% et recyclez !",
      background: { type: 'image', value: 'https://picsum.photos/seed/hero/1920/1080' }
    }
  }
};

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

export async function http<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  // Handle localStorage mock for development
  if (USE_LOCAL_STORAGE) {
    // Handle localStorage mock
    return new Promise((resolve) => {
      setTimeout(() => {
        // For GET requests, return stored data
        if (!options.method || options.method === 'GET') {
          const data = localStorageMock[path] || localStorage.getItem(`api_mock_${path}`);
          if (data) {
            resolve(typeof data === 'string' ? JSON.parse(data) : data);
          } else {
            resolve([] as any); // Default empty array for collections
          }
        } 
        // For POST/PUT requests, store the data
        else if (options.method === 'POST' || options.method === 'PUT') {
          try {
            const body = JSON.parse(options.body as string);
            localStorage.setItem(`api_mock_${path}`, JSON.stringify(body));
            resolve(body as any);
          } catch {
            resolve({} as any);
          }
        }
        // For DELETE requests, remove the data
        else if (options.method === 'DELETE') {
          localStorage.removeItem(`api_mock_${path}`);
          resolve({ success: true } as any);
        }
      }, 100); // Simulate network delay
    });
  }
  
  // Handle local API mode for development
  if (USE_LOCAL_API) throw new Error('local_api_mode');
  
  // Production mode - make actual API calls with timeout and error handling
  return new Promise(async (resolve, reject) => {
    // Add timeout for API calls
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout for ${path}`));
    }, 10000); // 10 second timeout
    
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        let err: any = { status: res.status };
        try { err.body = await res.json(); } catch {}
        throw err;
      }
      
      try {
        const data = await res.json();
        const sanitized = sanitizeApi(data, path);
        resolve(sanitized);
      } catch {
        resolve(undefined as any);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}