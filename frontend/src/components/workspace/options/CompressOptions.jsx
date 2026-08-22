import React, { useState } from 'react';

const LEVELS = [
  {
    value: 'haute',
    label: 'Haute compression',
    sublabel: '72 dpi — Réduction estimée ~80%',
    icon: 'compress',
  },
  {
    value: 'moyenne',
    label: 'Compression équilibrée',
    sublabel: '150 dpi — Réduction estimée ~50%',
    icon: 'balance',
  },
  {
    value: 'basse',
    label: 'Légère compression',
    sublabel: '300 dpi — Réduction estimée ~20%',
    icon: 'high_quality',
  },
];

export const CompressOptions = ({ onStart, isProcessing }) => {
  const [level, setLevel] = useState('moyenne');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onStart({ niveau: level });
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="font-display-xl text-title-md text-on-surface">Options de compression</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Choisissez le compromis qualité / taille qui vous convient.
        </p>
      </div>

      <div className="flex-1 p-6 space-y-3 overflow-y-auto">
        {LEVELS.map((opt) => {
          const isSelected = level === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setLevel(opt.value)}
              disabled={isProcessing || loading}
              className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-secondary bg-secondary-container/40'
                  : 'border-outline-variant hover:border-outline bg-surface-container'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'bg-secondary-container' : 'bg-surface'
              }`}>
                <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {opt.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className={`font-label-bold text-label-md ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                  {opt.label}
                </p>
                <p className="text-body-xs text-on-surface-variant mt-0.5">{opt.sublabel}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                isSelected ? 'border-secondary bg-secondary' : 'border-outline'
              }`} />
            </button>
          );
        })}
      </div>

      <div className="p-6 border-t border-outline-variant bg-surface">
        <button
          onClick={handleSubmit}
          disabled={isProcessing || loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Lancement…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">compress</span>
              Compresser le fichier
            </>
          )}
        </button>
      </div>
    </div>
  );
};
