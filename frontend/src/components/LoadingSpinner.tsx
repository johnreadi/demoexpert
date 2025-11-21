import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Chargement...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="spinner"></div>
      <p className="mt-4 text-lg font-semibold text-expert-blue">{message}</p>
    </div>
  );
};

export default LoadingSpinner;