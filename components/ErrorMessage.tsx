import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="w-full my-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700" role="alert">
      <p className="font-bold">Une erreur est survenue</p>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
