import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../services/api/axiosClient';

/**
 * Vérifie via l'API si un fichier PDF (déjà uploadé) est protégé
 * en inspectant le contenu binaire du fichier (recherche /Encrypt).
 */
async function verifierProtectionFichier(fileId) {
  try {
    const response = await axiosClient.get(`/files/download/${fileId}`, {
      responseType: 'arraybuffer',
    });
    const bytes = new Uint8Array(response.data);
    const HEAD_SIZE = 4096;
    const TAIL_SIZE = 4096;
    const toStr = (arr) => {
      let s = '';
      for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
      return s;
    };
    const head = toStr(bytes.slice(0, Math.min(HEAD_SIZE, bytes.length)));
    const tail = toStr(bytes.slice(Math.max(0, bytes.length - TAIL_SIZE)));
    return (head + tail).includes('/Encrypt');
  } catch {
    return null; // Indéterminé → laisser passer
  }
}

export const UnprotectOptions = ({ onStart, isProcessing, fichierCharge, fichierNonProtege, onReset }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // null = vérification en cours, true = protégé, false = non protégé
  const [statutProtection, setStatutProtection] = useState(null);
  const navigate = useNavigate();

  // Vérification automatique au montage si le fichier vient du dashboard
  // (fichierNonProtege n'est défini que si le fichier passe par DropZone dans l'outil)
  useEffect(() => {
    if (fichierNonProtege) {
      // DropZone a déjà détecté que ce fichier n'est pas protégé
      setStatutProtection(false);
      return;
    }
    if (!fichierCharge?.fileId) {
      setStatutProtection(true); // Pas de fichier → on affiche le formulaire
      return;
    }

    // Vérification binaire via l'API
    setStatutProtection(null); // En cours…
    verifierProtectionFichier(fichierCharge.fileId).then((estProtege) => {
      if (estProtege === null) {
        setStatutProtection(true); // Indéterminé → afficher le formulaire
      } else {
        setStatutProtection(estProtege);
      }
    });
  }, [fichierCharge?.fileId, fichierNonProtege]);

  const handleSubmit = async () => {
    if (!password.trim()) return;
    setLoading(true);
    const mdp = password;
    setPassword(''); // Purger immédiatement le mot de passe du DOM
    await onStart({ motDePasseActuel: mdp });
    setLoading(false);
  };

  // ── État : vérification en cours ──
  if (statutProtection === null) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 p-6 text-center">
        <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
        <p className="text-body-md text-on-surface-variant">Analyse du fichier en cours…</p>
      </div>
    );
  }

  // ── État : fichier NON protégé ──
  if (statutProtection === false) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-outline-variant">
          <h2 className="font-display-xl text-title-md text-on-surface">Déverrouiller le document</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Aucune action requise pour ce fichier.
          </p>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-title-md text-on-surface">PDF non protégé</h3>
            <p className="text-body-md text-on-surface-variant">
              Ce PDF n'est pas protégé par un mot de passe — aucun déverrouillage nécessaire. Utilisez un autre outil pour le traiter.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 mt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">apps</span>
              Retour à l'atelier
            </button>
            <button
              onClick={onReset}
              className="w-full text-on-surface-variant hover:bg-surface-container py-4 rounded-2xl font-label-bold text-label-lg transition-colors"
            >
              Choisir un autre fichier
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── État : fichier PROTÉGÉ → formulaire ──
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="font-display-xl text-title-md text-on-surface">Déverrouiller le document</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Saisissez le mot de passe actuel pour retirer la protection.
        </p>
      </div>

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-amber-700 mt-0.5">lock</span>
          <p className="text-body-sm text-amber-800">
            Ce PDF est protégé. Saisissez le mot de passe actuel pour le déverrouiller définitivement.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-label-md font-label-bold text-on-surface block mb-2">Mot de passe actuel</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isProcessing || loading}
              placeholder="Mot de passe du document"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 pr-10 bg-surface-container rounded-xl border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all text-body-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {password.length > 0 && password.length < 4 && (
            <p className="text-xs text-error mt-1">Le mot de passe semble trop court.</p>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-outline-variant bg-surface">
        <button
          onClick={handleSubmit}
          disabled={isProcessing || loading || !password.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Déverrouillage...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
              Retirer la protection
            </>
          )}
        </button>
      </div>
    </div>
  );
};
