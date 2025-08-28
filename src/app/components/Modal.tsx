'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-lg bg-gray-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-700 pb-3">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            &#x2715;
          </button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}