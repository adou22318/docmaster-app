import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', message, duration }) => {
    const id = ++toastIdCounter;
    const durations = { success: 4000, error: 6000, warning: 5000, info: 3000 };
    const d = duration ?? durations[type] ?? 4000;

    setToasts(prev => {
      const next = [...prev, { id, type, message }];
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });

    timersRef.current[id] = setTimeout(() => removeToast(id), d);
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, opts) => addToast({ type: 'success', message: msg, ...opts }),
    error:   (msg, opts) => addToast({ type: 'error',   message: msg, ...opts }),
    warning: (msg, opts) => addToast({ type: 'warning', message: msg, ...opts }),
    info:    (msg, opts) => addToast({ type: 'info',    message: msg, ...opts }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

// ── Composant de rendu ──────────────────────────────────────────────
const TOAST_STYLES = {
  success: {
    bg: 'bg-[#1a3c2e] border-[#2d6a4f]',
    icon: 'check_circle',
    iconColor: 'text-[#52b788]',
    bar: 'bg-[#52b788]',
  },
  error: {
    bg: 'bg-[#3c1a1a] border-[#6a2d2d]',
    icon: 'error',
    iconColor: 'text-[#f87171]',
    bar: 'bg-[#f87171]',
  },
  warning: {
    bg: 'bg-[#3c2e1a] border-[#6a4f2d]',
    icon: 'warning',
    iconColor: 'text-[#fbbf24]',
    bar: 'bg-[#fbbf24]',
  },
  info: {
    bg: 'bg-[#1a2a3c] border-[#2d4a6a]',
    icon: 'info',
    iconColor: 'text-[#60a5fa]',
    bar: 'bg-[#60a5fa]',
  },
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const s = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  return (
    <div
      className={`pointer-events-auto w-80 max-w-[90vw] rounded-2xl border ${s.bg} shadow-2xl overflow-hidden
        animate-[slideInRight_0.3s_ease-out]`}
      role="alert"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <span className={`material-symbols-outlined text-[22px] mt-0.5 flex-shrink-0 ${s.iconColor}`}
          style={{ fontVariationSettings: "'FILL' 1" }}>
          {s.icon}
        </span>
        <p className="flex-1 text-white text-body-sm leading-snug">{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <div className={`h-0.5 ${s.bar} w-full opacity-60`} />
    </div>
  );
};
