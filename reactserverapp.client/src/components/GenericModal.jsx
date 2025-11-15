import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal Bileşeni
 */
const GenericModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4 animate-in fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
        <div className="flex justify-between items-start mb-4 border-b pb-2">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default GenericModal;
