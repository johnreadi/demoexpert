import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-2xl font-bold font-heading text-expert-blue">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                <i className="fas fa-times"></i>
            </button>
        </div>
        <div className="overflow-y-auto pr-2">
            {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;