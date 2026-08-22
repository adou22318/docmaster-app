import React from 'react';

/**
 * RemovePagesOptions — Panneau latéral pour Supprimer des pages
 * La sélection contient les indices des pages qui seront supprimées.
 */
export const RemovePagesOptions = ({ onStart, isProcessing, selection = [], totalPages }) => {

  const handleLaunch = () => {
    if (!selection.length) return;
    // Le backend attend un tableau d'indices de pages à supprimer
    onStart({ pages: selection, selection: selection });
  };

  const remainingPages = (totalPages || 0) - selection.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Supprimer des pages</h3>
          <p className="text-body-sm text-on-surface-variant">
            Cliquez sur les pages à supprimer dans le visualiseur. Elles seront marquées en rouge.
          </p>
        </div>

        {/* Résumé */}
        <div className="p-4 bg-surface-container rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wide">À supprimer</span>
            <span className="text-label-md font-label-bold text-error">
              {selection.length} page{selection.length > 1 ? 's' : ''}
            </span>
          </div>
          {totalPages && (
            <div className="flex justify-between items-center">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wide">Restantes</span>
              <span className={`text-label-md font-label-bold ${remainingPages <= 0 ? 'text-error' : 'text-green-600'}`}>
                {remainingPages} page{remainingPages > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Pages sélectionnées visuellement */}
        {selection.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selection.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-600 rounded-full text-label-sm font-label-bold"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
                Page {p}
              </span>
            ))}
          </div>
        )}

        {/* Avertissement */}
        {remainingPages <= 0 && (
          <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/30 rounded-xl">
            <span className="material-symbols-outlined text-[16px] text-error mt-0.5">warning</span>
            <p className="text-body-sm text-error">
              Vous ne pouvez pas supprimer toutes les pages. Un PDF doit contenir au moins une page.
            </p>
          </div>
        )}
      </div>

      {/* Bouton d'action */}
      <div className="p-6 border-t border-outline-variant">
        {!selection.length && (
          <p className="text-label-sm text-on-surface-variant text-center mb-3">
            Sélectionnez au moins une page pour continuer.
          </p>
        )}
        <button
          onClick={handleLaunch}
          disabled={!selection.length || isProcessing || remainingPages <= 0}
          className="w-full flex items-center justify-center gap-2 py-4 bg-error text-white rounded-2xl font-label-bold text-label-lg hover:bg-error/90 disabled:opacity-50 transition-all"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Suppression en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">delete</span>
              Supprimer {selection.length} page{selection.length > 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
