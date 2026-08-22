import React, { useState } from 'react';
import { traduireSelection } from '../../../utils/formatters';

/**
 * PdfToImagesOptions — Panneau latéral pour l'outil PDF vers Images
 * Utilise le visualiseur en mode multiple pour sélectionner les pages à exporter.
 * Sélection vide = exporter toutes les pages.
 */
export const PdfToImagesOptions = ({ onStart, isProcessing, selection = [], totalPages }) => {
  const [dpi, setDpi] = useState(150);
  const [format, setFormat] = useState('png');

  const dpiOptions = [
    { value: 72, label: '72 DPI', sub: 'Web / Aperçu' },
    { value: 150, label: '150 DPI', sub: 'Standard' },
    { value: 300, label: '300 DPI', sub: 'Haute qualité' },
  ];

  const handleLaunch = () => {
    const options = { dpi, format };
    // Si l'utilisateur a sélectionné des pages spécifiques, les envoyer
    if (selection.length > 0 && selection.length < totalPages) {
      options.pages = traduireSelection(selection);
    }
    // Si aucune sélection ou toutes les pages : on n'envoie pas "pages" → backend extrait tout
    onStart(options);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Exporter en images</h3>
          <p className="text-body-sm text-on-surface-variant">
            Convertissez les pages de votre PDF en images individuelles.
          </p>
        </div>

        {/* Info sélection */}
        <div className="p-4 bg-surface-container rounded-xl">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mb-1">Pages à exporter</p>
          {selection.length > 0 && selection.length < totalPages ? (
            <p className="text-body-md text-on-surface font-label-bold">
              {selection.length} page{selection.length > 1 ? 's' : ''} sélectionnée{selection.length > 1 ? 's' : ''}
            </p>
          ) : (
            <p className="text-body-md text-on-surface font-label-bold">
              Toutes les pages ({totalPages || '…'})
            </p>
          )}
          <p className="text-body-sm text-on-surface-variant mt-1">
            Cliquez sur des pages spécifiques pour ne convertir que celles-ci.
          </p>
        </div>

        {/* Résolution */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Résolution</p>
          <div className="space-y-2">
            {dpiOptions.map((d) => (
              <label
                key={d.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  dpi === d.value
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50'
                }`}
              >
                <input type="radio" name="dpi" checked={dpi === d.value} onChange={() => setDpi(d.value)} className="accent-primary" />
                <div>
                  <p className="text-label-md font-label-bold text-on-surface">{d.label}</p>
                  <p className="text-body-sm text-on-surface-variant">{d.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Format d'image</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFormat('png')}
              className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                format === 'png' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
              }`}
            >
              <span className="text-label-md font-label-bold text-on-surface">PNG</span>
              <span className="text-label-xs text-on-surface-variant">Sans perte</span>
            </button>
            <button
              onClick={() => setFormat('jpg')}
              className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                format === 'jpg' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
              }`}
            >
              <span className="text-label-md font-label-bold text-on-surface">JPG</span>
              <span className="text-label-xs text-on-surface-variant">Plus léger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bouton d'action */}
      <div className="p-6 border-t border-outline-variant">
        <button
          onClick={handleLaunch}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Conversion en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">burst_mode</span>
              Exporter en {format.toUpperCase()}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
