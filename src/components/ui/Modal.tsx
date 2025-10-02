'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = ""
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl',
    xl: 'max-w-2xl sm:max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className={`bg-white/98 backdrop-blur-md rounded-xl shadow-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slide-in ${sizeClasses[size]} ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-border bg-[var(--light-gray)]/30">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--navy)] font-serif truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--light-gray)] rounded-lg transition-colors duration-200 flex-shrink-0"
          >
            <X className="w-5 h-5 text-[var(--navy)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
