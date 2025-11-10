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
}
