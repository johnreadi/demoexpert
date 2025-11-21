import React from 'react';
import * as api from './api';

console.log('API module loaded:', Object.keys(api));

export default function TestApiOnly(): React.ReactNode {
  return (
    <div>
      <h1>Test API Only</h1>
      <p>Check the console to see if the API module is imported correctly.</p>
      <p>API functions: {Object.keys(api).join(', ')}</p>
    </div>
  );
}