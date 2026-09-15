import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Composant unifié pour afficher une erreur de format de fichier incompatible.
 * Reproduit exactement le pattern de l'erreur "PDF protégé par mot de passe".
 *
 * @param {string}   message      - Message d'erreur à afficher
 * @param {Function} onChangeFile - Callback pour changer de fichier (reset)
 * @param {boolean}  showConvert  - Afficher le bouton "Convertir en PDF" (true par défaut)
 */
export const FileFormatError = ({ message, onChangeFile, showConvert = true }) => {
  const navigate = useNavigate();

  if (!message) return null;

  const handleConvert = () => {
    navigate('/dashboard/tools/convert_to_pdf');
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-error/10 border border-error/30 rounded-xl">
      {/* Ligne du message */}
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[18px] text-error mt-0.5 shrink-0">
          error
        </span>
        <p className="text-body-sm text-error whitespace-pre-wrap flex-1">{message}</p>
      </div>

      {/* Boutons d'action en bas à droite */}
      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
        {onChangeFile && (
          <button
            onClick={onChangeFile}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-error/30 text-error rounded-lg text-label-sm font-label-bold hover:bg-error/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            Changer
          </button>
        )}
        {showConvert && (
          <button
            onClick={handleConvert}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-error text-on-error rounded-lg text-label-sm font-label-bold hover:bg-error/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">autorenew</span>
            Convertir en PDF
          </button>
        )}
      </div>
    </div>
  );
};
