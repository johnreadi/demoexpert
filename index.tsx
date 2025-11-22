import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { installStorageGuard } from './services/storageGuard';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  installStorageGuard();
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Fallback: create the root element if it doesn't exist
  console.warn('Root element not found, creating fallback');
  const fallbackContainer = document.createElement('div');
  fallbackContainer.id = 'root';
  document.body.appendChild(fallbackContainer);
  
  const root = createRoot(fallbackContainer);
  installStorageGuard();
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}