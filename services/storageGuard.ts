function makeNoopStorage(name: string): Storage {
  const warn = (method: string) => {
    // eslint-disable-next-line no-console
    console.warn(`[${name}] utilisation bloquée (${method})`);
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
  if (typeof window !== 'undefined') {
    const useLocal = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';
    const isLocalHost = /^localhost$|^127\.0\.0\.1$/.test(window.location.hostname);
    const shouldBlock = !useLocal || import.meta.env.MODE === 'production' || !isLocalHost || (window as any).__FORCE_BLOCK_STORAGE === true;
    if (shouldBlock) {
      try {
        Object.defineProperty(window, 'localStorage', { value: makeNoopStorage('localStorage') });
        Object.defineProperty(window, 'sessionStorage', { value: makeNoopStorage('sessionStorage') });
      } catch {
        // ignore
      }
    }
  }
}
