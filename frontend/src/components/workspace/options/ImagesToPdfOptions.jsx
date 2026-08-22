import React, { useState } from 'react';

export const ImagesToPdfOptions = ({ onStart, isProcessing }) => {
  const [orientation, setOrientation] = useState('auto'); // auto, portrait, landscape
  const [format, setFormat] = useState('a4'); // a4, letter, auto
  const [margin, setMargin] = useState('none'); // none, small, large

  const handleSubmit = () => {
    onStart({ orientation, format, margin });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="font-display-xl text-title-md text-on-surface">Images vers PDF</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Ajustez la mise en page de vos images.
        </p>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        {/* Orientation */}
        <div className="space-y-3">
          <label className="text-label-md font-label-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">screen_rotation</span>
            Orientation
          </label>
          <div className="flex bg-surface-container p-1 rounded-xl">
            <button
              onClick={() => setOrientation('auto')}
              className={`flex-1 py-2 px-3 text-label-sm font-label-bold rounded-lg transition-colors ${
                orientation === 'auto' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`flex-1 py-2 px-3 text-label-sm font-label-bold rounded-lg transition-colors ${
                orientation === 'portrait' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Portrait
            </button>
            <button
              onClick={() => setOrientation('landscape')}
              className={`flex-1 py-2 px-3 text-label-sm font-label-bold rounded-lg transition-colors ${
                orientation === 'landscape' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Paysage
            </button>
          </div>
        </div>

        {/* Format de page */}
        <div className="space-y-3">
          <label className="text-label-md font-label-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">insert_page_break</span>
            Taille de la page
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFormat('a4')}
              className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                format === 'a4' 
                  ? 'border-secondary bg-secondary-container/20 text-on-surface' 
                  : 'border-outline-variant text-on-surface-variant hover:border-secondary/50'
              }`}
            >
              <span className="font-label-bold text-label-md">A4</span>
              <span className="text-body-xs opacity-70">Standard</span>
            </button>
            <button
              onClick={() => setFormat('letter')}
              className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                format === 'letter' 
                  ? 'border-secondary bg-secondary-container/20 text-on-surface' 
                  : 'border-outline-variant text-on-surface-variant hover:border-secondary/50'
              }`}
            >
              <span className="font-label-bold text-label-md">US Letter</span>
              <span className="text-body-xs opacity-70">216 × 279 mm</span>
            </button>
          </div>
        </div>

        {/* Marges */}
        <div className="space-y-3">
          <label className="text-label-md font-label-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">padding</span>
            Marge
          </label>
          <div className="flex bg-surface-container p-1 rounded-xl">
            <button
              onClick={() => setMargin('none')}
              className={`flex-1 py-2 px-3 text-label-sm font-label-bold rounded-lg transition-colors ${
                margin === 'none' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Aucune
            </button>
            <button
              onClick={() => setMargin('small')}
              className={`flex-1 py-2 px-3 text-label-sm font-label-bold rounded-lg transition-colors ${
                margin === 'small' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Petite
            </button>
            <button
              onClick={() => setMargin('large')}
              className={`flex-1 py-2 px-3 text-label-sm font-label-bold rounded-lg transition-colors ${
                margin === 'large' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Grande
            </button>
          </div>
        </div>

      </div>

      <div className="p-6 border-t border-outline-variant bg-surface">
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Génération…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              Créer le PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};
