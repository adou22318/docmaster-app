import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

// ── Durées par type ──────────────────────────────────────────────────────────
const DURATIONS = { success: 5000, error: 8000, warning: 6000, info: 4000 };

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
    const d = duration ?? DURATIONS[type] ?? 4000;

    setToasts(prev => {
      // Max 5 toasts simultanés — retire les plus anciens
      const next = [...prev, { id, type, message, duration: d, createdAt: Date.now() }];
      return next.length > 5 ? next.slice(next.length - 5) : next;
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

// ── Config visuelle par type ─────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    icon: 'check_circle',
    iconClass: 'text-emerald-400',
    barClass: 'bg-emerald-400',
    borderClass: 'border-emerald-500/30',
    labelClass: 'text-emerald-300',
    label: 'Succès',
  },
  error: {
    icon: 'error',
    iconClass: 'text-red-400',
    barClass: 'bg-red-400',
    borderClass: 'border-red-500/30',
    labelClass: 'text-red-300',
    label: 'Erreur',
  },
  warning: {
    icon: 'warning',
    iconClass: 'text-amber-400',
    barClass: 'bg-amber-400',
    borderClass: 'border-amber-500/30',
    labelClass: 'text-amber-300',
    label: 'Attention',
  },
  info: {
    icon: 'info',
    iconClass: 'text-sky-400',
    barClass: 'bg-sky-400',
    borderClass: 'border-sky-500/30',
    labelClass: 'text-sky-300',
    label: 'Info',
  },
};

// ── Conteneur ────────────────────────────────────────────────────────────────
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

// ── Toast individuel ─────────────────────────────────────────────────────────
const Toast = ({ toast, onRemove }) => {
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // Barre de progression animée
  useEffect(() => {
    const start = Date.now();
    const total = toast.duration || 4000;
    const raf = { id: null };

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / total) * 100);
      setProgress(pct);
      if (pct > 0) raf.id = requestAnimationFrame(tick);
    };
    raf.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.id);
  }, [toast.duration]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      role="alert"
      aria-atomic="true"
      className={`pointer-events-auto w-[360px] max-w-[calc(100vw-48px)] rounded-2xl border
        bg-[#1e2023] ${cfg.borderClass} shadow-2xl overflow-hidden
        transition-all duration-200
        ${exiting
          ? 'opacity-0 translate-x-4 scale-95'
          : 'opacity-100 translate-x-0 scale-100 animate-[toastIn_0.25s_cubic-bezier(0.175,0.885,0.32,1.275)]'
        }`}
    >
      {/* Corps du toast */}
      <div className="flex items-start gap-3 px-4 pt-3 pb-3">
        {/* Icône */}
        <span
          className={`material-symbols-outlined text-[22px] mt-0.5 flex-shrink-0 ${cfg.iconClass}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {cfg.icon}
        </span>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          {/* Label de type */}
          <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${cfg.labelClass}`}>
            {cfg.label}
          </p>
          {/* Message — word-break pour les longs mots/URLs */}
          <p className="text-sm text-white/90 leading-snug break-words whitespace-pre-wrap">
            {toast.message}
          </p>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors p-0.5
            rounded-full hover:bg-white/10 -mt-0.5 -mr-1"
          aria-label="Fermer la notification"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      {/* Barre de progression */}
      <div className="h-0.5 bg-white/5">
        <div
          className={`h-full ${cfg.barClass} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
