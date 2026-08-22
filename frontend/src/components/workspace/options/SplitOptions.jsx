import React, { useState } from 'react';
import { traduireSelection } from '../../../utils/formatters';

/**
 * SplitOptions — Panneau latéral pour l'outil Diviser
 * Reçoit la sélection visuelle du viewer et la formate en string compatible parsePages.js
 */
export const SplitOptions = ({ onStart, isProcessing, selection = [] }) => {
  const [mode, setMode] = useState('single'); // 'single' | 'separate'

  const selectionString = traduireSelection(selection);

  const handleLaunch = () => {
    if (!selectionString) return;
    onStart({ pages: selectionString, selection: selectionString, mode });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Options de division</h3>
          <p className="text-body-sm text-on-surface-variant">
            Sélectionnez les pages dans le visualiseur puis choisissez le mode d'extraction.
          </p>
        </div>

        {/* Résumé de la sélection */}
        <div className="p-4 bg-surface-container rounded-xl space-y-2">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Pages sélectionnées</p>
          {selectionString ? (
            <p className="text-body-md text-on-surface font-label-bold">{selectionString}</p>
          ) : (
            <p className="text-body-sm text-on-surface-variant italic">Aucune page sélectionnée</p>
          )}
        </div>

        {/* Mode d'extraction */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Mode d'extraction</p>
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              mode === 'single'
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name="splitMode"
              checked={mode === 'single'}
              onChange={() => setMode('single')}
              className="mt-0.5 accent-primary"
            />
            <div>
              <p className="text-label-md font-label-bold text-on-surface">PDF unique</p>
              <p className="text-body-sm text-on-surface-variant">
                Toutes les pages extraites dans un seul fichier PDF.
              </p>
            </div>
          </label>
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              mode === 'separate'
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name="splitMode"
              checked={mode === 'separate'}
              onChange={() => setMode('separate')}
              className="mt-0.5 accent-primary"
            />
            <div>
              <p className="text-label-md font-label-bold text-on-surface">Fichiers séparés</p>
              <p className="text-body-sm text-on-surface-variant">
                Chaque plage sélectionnée sera un PDF distinct (archive ZIP si plusieurs).
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Bouton d'action */}
      <div className="p-6 border-t border-outline-variant">
        {!selectionString && (
          <p className="text-label-sm text-on-surface-variant text-center mb-3">
            Sélectionnez au moins une page pour continuer.
          </p>
        )}
        <button
          onClick={handleLaunch}
          disabled={!selectionString || isProcessing}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Division en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">content_cut</span>
              Diviser le PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};
