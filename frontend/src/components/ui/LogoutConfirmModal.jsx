import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axiosClient from '../../services/api/axiosClient';
import { useFileStore } from '../../store/useFileStore';

/**
 * Modale de confirmation de déconnexion.
 * Informe l'utilisateur que ses fichiers seront supprimés définitivement,
 * les supprime via l'API, puis exécute le logout.
 *
 * @param {boolean}  isOpen       - Afficher ou non la modale
 * @param {Function} onCancel     - Fermer sans déconnecter
 * @param {Function} onConfirm    - Appelé après suppression, pour déclencher le vrai logout
 */
export const LogoutConfirmModal = ({ isOpen, onCancel, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const clearCurrentFile = useFileStore((state) => state.clearCurrentFile);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      // Supprimer tous les fichiers côté serveur
      await axiosClient.delete('/files/all');
      // Vider l'état local du store
      clearCurrentFile();
      // Déclencher le logout (caller gère la navigation)
      onConfirm();
    } catch (err) {
      console.error('Erreur suppression fichiers:', err);
      setError('Impossible de supprimer les fichiers. Vous serez quand même déconnecté.');
      // On déconnecte quand même après 2s pour ne pas bloquer l'utilisateur
      setTimeout(() => {
        clearCurrentFile();
        onConfirm();
      }, 2000);
    } finally {
      setIsDeleting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-surface rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 border border-outline-variant"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icône */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[32px] text-error"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              delete_sweep
            </span>
          </div>
        </div>

        {/* Titre */}
        <div className="text-center space-y-2">
          <h2 className="font-display-xl text-headline-sm text-on-surface">
            Avant de partir…
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            Pour respecter votre confidentialité, <strong>tous vos fichiers</strong> (documents importés et résultats générés) seront <strong>définitivement supprimés</strong> de nos serveurs lors de votre déconnexion.
          </p>
        </div>

        {/* Avertissement */}
        <div className="flex items-start gap-3 p-4 bg-error/8 border border-error/20 rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-error mt-0.5 shrink-0">warning</span>
          <p className="text-body-sm text-error">
            Cette action est irréversible. Assurez-vous d'avoir téléchargé tous les fichiers dont vous avez besoin avant de continuer.
          </p>
        </div>

        {/* Erreur réseau */}
        {error && (
          <div className="flex items-start gap-3 p-3 bg-error/10 border border-error/30 rounded-xl">
            <span className="material-symbols-outlined text-[16px] text-error mt-0.5 shrink-0">info</span>
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 px-6 rounded-2xl border border-outline-variant text-on-surface font-label-bold text-label-lg hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-6 rounded-2xl bg-error text-on-error font-label-bold text-label-lg hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Suppression…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Se déconnecter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
