import React from 'react';

export const MergeOptions = ({ onStart, isProcessing }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="font-display-xl text-title-md text-on-surface">Fusion des documents</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Aucun paramétrage complexe n'est requis.
        </p>
      </div>

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary-container/50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[32px]">sort</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-label-bold text-label-lg text-on-surface">Prêt pour la fusion</h3>
            <p className="text-body-sm text-on-surface-variant max-w-[250px]">
              L'ordre des fichiers défini à l'étape précédente sera conservé dans le document PDF final.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-outline-variant bg-surface">
        <button
          onClick={() => onStart({})}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Fusion en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">merge</span>
              Fusionner les fichiers
            </>
          )}
        </button>
      </div>
    </div>
  );
};
