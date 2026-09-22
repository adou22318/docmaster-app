import React from 'react';
import { traduireSelection } from '../../../utils/formatters';

/**
 * ExtractPagesOptions — Panneau lateral pour l'outil Extraire des pages
 * Alias UX de SplitOptions en mode 'single' uniquement.
 * L'utilisateur selectionne les pages a CONSERVER (non a couper).
 */
export const ExtractPagesOptions = ({ onStart, isProcessing, selection = [] }) => {

  const selectionString = traduireSelection(selection);

  const handleLaunch = () => {
    if (!selectionString) return;
    // Toujours mode 'single' : 1 PDF contenant les pages selectionnees
    onStart({ pages: selectionString, selection: selectionString, mode: 'single' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Extraire des pages</h3>
          <p className="text-body-sm text-on-surface-variant">
            Selectionnez les pages a conserver. Elles seront extraites dans un nouveau document PDF.
          </p>
        </div>

        {/* Resume de la selection */}
        <div className="p-4 bg-surface-container rounded-xl space-y-2">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Pages a extraire</p>
          {selectionString ? (
            <div>
              <p className="text-body-md text-on-surface font-label-bold">{selectionString}</p>
              <p className="text-label-xs text-on-surface-variant mt-1">
                {selection.length} page{selection.length > 1 ? 's' : ''} selectionnee{selection.length > 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant italic">Aucune page selectionnee</p>
          )}
        </div>

        {/* Info sur le resultat */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">description</span>
            <p className="text-label-sm font-label-bold text-on-surface">Resultat : 1 PDF</p>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Les pages selectionnees seront regroupees dans un seul fichier PDF, dans l&apos;ordre du document source.
          </p>
        </div>

        {/* Distinction avec l'outil Division */}
        <div className="flex items-start gap-2 p-3 bg-surface-container rounded-xl">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">info</span>
          <p className="text-body-sm text-on-surface-variant">
            Pour obtenir plusieurs PDF separes (un par plage), utilisez l&apos;outil <strong>Diviser un PDF</strong> avec le mode &laquo;&nbsp;Fichiers separes&nbsp;&raquo;.
          </p>
        </div>
      </div>

      {/* Bouton d action */}
      <div className="p-6 border-t border-outline-variant">
        {!selectionString && (
          <p className="text-label-sm text-on-surface-variant text-center mb-3">
            Selectionnez au moins une page dans le visualiseur.
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
              Extraction en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">file_copy</span>
              Extraire {selection.length > 0 ? `${selection.length} page${selection.length > 1 ? 's' : ''}` : 'les pages'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
