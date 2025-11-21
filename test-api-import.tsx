import React from 'react';
import * as api from './api';

console.log('API module:', api);

export default function TestApiImport(): React.ReactNode {
  return (
    <div>
      <h1>Test API Import</h1>
      <p>Check the console to see if the API module is imported correctly.</p>
    </div>
  );
}