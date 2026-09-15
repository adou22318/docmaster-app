import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * SignatureDisclaimer — Modale bloquante affichée à l'entrée de l'outil Signature.
 *
 * Comportement :
 * - Clic backdrop → ferme la modale et renvoie l'utilisateur en arrière (onClose).
 *   L'accès à la signature N'EST PAS accordé sans validation de la case.
 * - Clé sessionStorage par userId → chaque compte doit valider au moins une fois par session.
 * - L'utilisateur doit cocher la case et cliquer "Continuer" pour accéder à l'outil.
 */

const getSessionKey = (userId) =>
  `docmaster_sig_disclaimer_${userId || 'anon'}`;

export const SignatureDisclaimer = ({ onAccept, onClose }) => {
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    if (!checked) return;
    const { user } = useAuthStore.getState();
    sessionStorage.setItem(getSessionKey(user?.id), 'true');
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop : clic = fermer sans accorder l'accès */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        aria-label="Annuler et revenir en arrière"
      />

      {/* Modale */}
      <div
        className="relative bg-surface rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer (coin haut-droite) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}

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
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-3">
          <p className="text-body-md text-on-surface leading-relaxed">
            La signature apposée par cet outil est une <strong>signature électronique simple</strong> (image ou dessin).
          </p>
          <p className="text-body-md text-on-surface leading-relaxed">
            Elle <strong>n'a pas de valeur juridique certifiée</strong>. Elle ne constitue pas une signature électronique qualifiée au sens des réglementations en vigueur.
          </p>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            Pour un acte à valeur légale opposable, utilisez un service de signature électronique certifié (signature qualifiée avec horodatage et authentification forte).
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

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-label-bold hover:bg-surface-container transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleAccept}
            disabled={!checked}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-label-bold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Continuer
          </button>
        </div>

        <p className="text-center text-label-sm text-on-surface-variant">
          Cette confirmation est demandée à chaque nouvelle session.
        </p>
      </div>
    </div>
  );
};

/**
 * Vérifie si le disclaimer a été accepté dans la session courante
 * pour l'utilisateur connecté (clé spécifique à son ID).
 */
export const isDisclaimerAccepted = () => {
  const { user } = useAuthStore.getState();
  return sessionStorage.getItem(getSessionKey(user?.id)) === 'true';
};
