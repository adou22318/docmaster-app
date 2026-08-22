import React, { useState } from 'react';

/**
 * SignatureDisclaimer — Modale bloquante affichée à l'entrée de l'outil Signature
 * L'utilisateur doit cocher "J'ai compris" pour pouvoir continuer.
 * La confirmation est mémorisée en sessionStorage.
 */

const SESSION_KEY = 'docmaster_signature_disclaimer_accepted';

export const SignatureDisclaimer = ({ onAccept }) => {
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    if (!checked) return;
    sessionStorage.setItem(SESSION_KEY, 'true');
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modale */}
      <div className="relative bg-surface rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
        {/* Icône */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px] text-amber-600">warning</span>
          </div>
        </div>

        {/* Titre */}
        <h2 className="font-display-xl text-headline-sm text-on-surface text-center">
          Information importante
        </h2>

        {/* Contenu */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <p className="text-body-md text-on-surface leading-relaxed">
            La signature apposée par cet outil est une <strong>signature électronique simple</strong> (image).
          </p>
          <p className="text-body-md text-on-surface leading-relaxed">
            Elle <strong>n'a pas de valeur juridique certifiée</strong> et ne respecte pas la norme <strong>eIDAS</strong>.
          </p>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            Pour une signature légalement opposable, utilisez un service certifié conforme au règlement eIDAS.
          </p>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-surface-container transition-colors">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 w-5 h-5 accent-primary"
          />
          <span className="text-body-md text-on-surface">
            J'ai lu et compris que cette signature est une signature simple, sans valeur juridique certifiée.
          </span>
        </label>

        {/* Bouton */}
        <button
          onClick={handleAccept}
          disabled={!checked}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-on-primary rounded-xl font-label-bold text-label-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          Continuer
        </button>
      </div>
    </div>
  );
};

/**
 * Vérifie si le disclaimer a été accepté dans la session courante.
 */
export const isDisclaimerAccepted = () => {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
};
