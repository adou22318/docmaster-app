import React, { useState } from 'react';

/**
 * RotateOptions — Panneau latéral pour la Rotation de pages
 */
export const RotateOptions = ({ onStart, isProcessing, selection = [] }) => {
  const [angle, setAngle] = useState(90);

  const angles = [
    { value: 90, label: '90°', icon: 'rotate_right' },
    { value: 180, label: '180°', icon: 'sync' },
    { value: 270, label: '270°', icon: 'rotate_left' },
  ];

  const handleLaunch = () => {
    if (!selection.length) return;
    onStart({ pages: selection, selection: selection, angle });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Rotation de pages</h3>
          <p className="text-body-sm text-on-surface-variant">
            Sélectionnez les pages à faire pivoter, puis choisissez l'angle de rotation.
          </p>
        </div>

        {/* Résumé sélection */}
        <div className="p-4 bg-surface-container rounded-xl">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mb-1">Pages sélectionnées</p>
          {selection.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selection.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded-full text-label-sm font-label-bold"
                >
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant italic">Aucune page sélectionnée</p>
          )}
        </div>

        {/* Angle de rotation */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Angle de rotation</p>
          <div className="grid grid-cols-3 gap-2">
            {angles.map((a) => (
              <button
                key={a.value}
                onClick={() => setAngle(a.value)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                  angle === a.value
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50'
                }`}
              >
                <span className="material-symbols-outlined text-[24px] text-on-surface">{a.icon}</span>
                <span className="text-label-md font-label-bold text-on-surface">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-surface-container rounded-xl">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">info</span>
          <p className="text-body-sm text-on-surface-variant">
            La rotation est appliquée dans le sens des aiguilles d'une montre. Les pages non sélectionnées resteront inchangées.
          </p>
        </div>
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
          disabled={!selection.length || isProcessing}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Rotation en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">rotate_right</span>
              Pivoter {selection.length} page{selection.length > 1 ? 's' : ''} de {angle}°
            </>
          )}
        </button>
      </div>
    </div>
  );
};
