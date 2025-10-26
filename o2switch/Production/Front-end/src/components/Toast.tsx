import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Fermeture automatique après 5 secondes

    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = "flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg animate-fade-in-right";
  const typeClasses = {
    success: 'text-green-500 bg-green-100',
    error: 'text-red-500 bg-red-100',
    info: 'text-blue-500 bg-blue-100',
  };
  const iconClasses = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
  };

  return (
    <div className={`${baseClasses}`} role="alert">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${typeClasses[type]} rounded-lg`}>
        <i className={`${iconClasses[type]}`}></i>
        <span className="sr-only">{type} icon</span>
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;
