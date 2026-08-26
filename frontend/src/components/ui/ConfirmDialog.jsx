import React from 'react';

export const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirmer', 
  cancelText = 'Annuler',
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        onClick={onCancel}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md p-6 bg-surface rounded-3xl shadow-2xl border border-outline-variant animate-[scaleIn_0.2s_ease-out]">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isDestructive ? 'bg-error-container text-error' : 'bg-secondary-container text-primary'}`}>
            <span className="material-symbols-outlined text-[24px]">
              {isDestructive ? 'warning' : 'help'}
            </span>
          </div>
          <h3 className="font-display-md text-title-lg text-on-surface">
            {title}
          </h3>
        </div>
        
        <p className="text-body-md text-on-surface-variant mb-8 pl-16">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-label-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-label-bold transition-all shadow-sm ${
              isDestructive 
                ? 'bg-error text-on-error hover:bg-error/90' 
                : 'bg-primary text-on-primary hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
};
