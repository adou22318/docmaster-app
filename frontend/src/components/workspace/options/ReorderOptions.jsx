import React from 'react';

/**
 * ReorderOptions — Panneau lateral pour la Reorganisation de pages
 * Recoit pageOrder (etat actuel de l ordre) depuis ToolWorkspaceLayout
 * et appelle onStart avec { nouvelOrdre: pageOrder }
 */
export const ReorderOptions = ({ onStart, isProcessing, pageOrder = [], totalPages = 0 }) => {

  const ordreModifie = pageOrder.length > 0 && pageOrder.some((p, i) => p !== i + 1);

  const handleLaunch = () => {
    if (!ordreModifie || isProcessing) return;
    onStart({ nouvelOrdre: pageOrder });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Reorganiser les pages</h3>
          <p className="text-body-sm text-on-surface-variant">
            Glissez-deposez les vignettes dans le visualiseur pour definir le nouvel ordre, puis confirmez.
          </p>
        </div>

        {/* Indicateur etat de l ordre */}
        <div className="p-4 bg-surface-container rounded-xl space-y-2">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Etat de l&apos;ordre</p>
          {pageOrder.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">En attente du chargement du document…</p>
          ) : ordreModifie ? (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-500">swap_vert</span>
              <p className="text-body-md font-label-bold text-on-surface">
                Ordre modifie
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">check_circle</span>
              <p className="text-body-sm text-on-surface-variant italic">
                Ordre d&apos;origine — deplacez au moins une page
              </p>
            </div>
          )}
        </div>

        {/* Apercu du nouvel ordre (si modifie) */}
        {ordreModifie && (
          <div className="p-4 bg-surface-container rounded-xl space-y-2">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Nouvel ordre</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {pageOrder.map((pageNum, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-bold ${
                    pageNum !== index + 1
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {pageNum}
                </span>
              ))}
            </div>
            <p className="text-label-xs text-on-surface-variant mt-1">
              Les numeros en orange ont change de position.
            </p>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-surface-container rounded-xl">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">info</span>
          <p className="text-body-sm text-on-surface-variant">
            Toutes les pages sont conservees — seul leur ordre change dans le document final.
          </p>
        </div>
      </div>

      {/* Bouton d action */}
      <div className="p-6 border-t border-outline-variant">
        {!ordreModifie && pageOrder.length > 0 && (
          <p className="text-label-sm text-on-surface-variant text-center mb-3">
            Deplacez au moins une page dans le visualiseur pour continuer.
          </p>
        )}
        <button
          onClick={handleLaunch}
          disabled={!ordreModifie || isProcessing}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Reorganisation en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">swap_vert</span>
              Reorganiser le PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};
