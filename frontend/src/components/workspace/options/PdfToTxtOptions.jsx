import React, { useState } from 'react';

export const PdfToTxtOptions = ({ onStart, isProcessing }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onStart({});
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="font-display-xl text-title-md text-on-surface">Extraire le texte</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Extrayez le texte brut de votre PDF en un fichier .txt.
        </p>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="p-4 bg-surface-container rounded-xl space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Ce qui sera extrait</p>
          {[
            { icon: 'text_fields', label: 'Tout le texte du document' },
            { icon: 'format_list_numbered', label: 'Chiffres et données' },
            { icon: 'translate', label: 'Texte multilingue' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-secondary">{item.icon}</span>
              <span className="text-label-sm text-on-surface">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 p-4 bg-surface-container/60 rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">warning</span>
          <p className="text-body-sm text-on-surface-variant">
            Les images, tableaux complexes et textes stylisés peuvent ne pas être extraits fidèlement.
          </p>
        </div>
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
              <span className="material-symbols-outlined text-[20px]">text_snippet</span>
              Extraire le texte
            </>
          )}
        </button>
      </div>
    </div>
  );
};
