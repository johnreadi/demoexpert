function makeNoopStorage(name: string): Storage {
  const warn = (method: string) => {
    if (import.meta.env.MODE !== 'production') return;
    // eslint-disable-next-line no-console
    console.warn(`[${name}] utilisation bloquée en production (${method})`);
  };
  return {
    get length() { return 0; },
    clear() { warn('clear'); },
    getItem(_key: string) { warn('getItem'); return null; },
    key(_index: number) { warn('key'); return null; },
    removeItem(_key: string) { warn('removeItem'); },
    setItem(_key: string, _value: string) { warn('setItem'); },
  } as Storage;
}

export function installStorageGuard() {
  if (import.meta.env.MODE === 'production' && typeof window !== 'undefined') {
    try {
      Object.defineProperty(window, 'localStorage', { value: makeNoopStorage('localStorage') });
      Object.defineProperty(window, 'sessionStorage', { value: makeNoopStorage('sessionStorage') });
    } catch {
      // ignore
    }
  }
}
