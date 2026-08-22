import React, { useState } from 'react';
import { traduireSelection } from '../../../utils/formatters';

/**
 * ExtractImagesOptions — Panneau latéral pour Extraire des images
 * Offre le choix : extraire toutes les images ou seulement celles des pages sélectionnées.
 */
export const ExtractImagesOptions = ({ onStart, isProcessing, selection = [], totalPages }) => {
  const [extractMode, setExtractMode] = useState('all'); // 'all' | 'selection'

  const handleLaunch = () => {
    const options = {};
    if (extractMode === 'selection' && selection.length > 0) {
      const selString = traduireSelection(selection);
      options.pages = selString;
      options.selection = selString;
    }
    onStart(options);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Extraire les images</h3>
          <p className="text-body-sm text-on-surface-variant">
            Récupérez les images incorporées dans votre PDF (photos, logos, graphiques).
          </p>
        </div>

        {/* Mode d'extraction */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Périmètre</p>

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              extractMode === 'all' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            <input type="radio" name="extractMode" checked={extractMode === 'all'} onChange={() => setExtractMode('all')} className="mt-0.5 accent-primary" />
            <div>
              <p className="text-label-md font-label-bold text-on-surface">Toutes les pages</p>
              <p className="text-body-sm text-on-surface-variant">
                Extraire les images de l'ensemble du document ({totalPages || '…'} pages).
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              extractMode === 'selection' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            <input type="radio" name="extractMode" checked={extractMode === 'selection'} onChange={() => setExtractMode('selection')} className="mt-0.5 accent-primary" />
            <div>
              <p className="text-label-md font-label-bold text-on-surface">Pages sélectionnées uniquement</p>
              <p className="text-body-sm text-on-surface-variant">
                {selection.length > 0
                  ? `${selection.length} page${selection.length > 1 ? 's' : ''} sélectionnée${selection.length > 1 ? 's' : ''}`
                  : 'Cliquez sur les pages dans le visualiseur'}
              </p>
            </div>
          </label>
        </div>

        {/* Avertissement si mode sélection et rien sélectionné */}
        {extractMode === 'selection' && selection.length === 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5">info</span>
            <p className="text-body-sm text-amber-700">
              Sélectionnez au moins une page dans le visualiseur pour extraire ses images.
            </p>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-surface-container rounded-xl">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">info</span>
          <p className="text-body-sm text-on-surface-variant">
            Seules les images embarquées nativement dans le PDF sont extraites. Le texte et la mise en page sont ignorés.
          </p>
        </div>
      </div>

      {/* Bouton d'action */}
      <div className="p-6 border-t border-outline-variant">
        <button
          onClick={handleLaunch}
          disabled={isProcessing || (extractMode === 'selection' && selection.length === 0)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Extraction en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">image</span>
              Extraire les images
            </>
          )}
        </button>
      </div>
    </div>
  );
};
