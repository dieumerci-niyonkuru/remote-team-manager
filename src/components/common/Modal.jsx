import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="bg-[#0d1425] border border-gray-800 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 my-auto">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-black text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-xl text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
