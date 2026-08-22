import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export const ModalePdfProtege = ({ fichier, onEntrerMotDePasse, onDevrouiller, onAnnuler }) => {
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [tentatives, setTentatives] = useState(0);
  const [erreur, setErreur] = useState(null);
  const [bloqueJusqua, setBloqueJusqua] = useState(null);
  const [decompte, setDecompte] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (bloqueJusqua) {
      interval = setInterval(() => {
        const reste = Math.ceil((bloqueJusqua - Date.now()) / 1000);
        if (reste <= 0) {
          setBloqueJusqua(null);
          setDecompte(0);
          setTentatives(0);
          setErreur(null);
          clearInterval(interval);
        } else {
          setDecompte(reste);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [bloqueJusqua]);

  const validerMotDePasse = async (e) => {
    if (e) e.preventDefault();
    if (!motDePasse || bloqueJusqua || isLoading) return;

    setIsLoading(true);
    setErreur(null);

    try {
      const arrayBuffer = await fichier.arrayBuffer();
      
      // Essayer d'ouvrir avec pdfjs
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        password: motDePasse
      });

      await loadingTask.promise;
      
      // Si on arrive ici, le mot de passe est correct
      onEntrerMotDePasse(motDePasse);

    } catch (error) {
      // 1 = PasswordException dans pdfjs
      if (error.name === 'PasswordException') {
        const nouvellesTentatives = tentatives + 1;
        setTentatives(nouvellesTentatives);
        
        if (nouvellesTentatives >= 5) {
          setBloqueJusqua(Date.now() + 30000);
          setErreur("Trop de tentatives.");
        } else {
          setErreur(`Mot de passe incorrect.`);
        }
      } else {
        // Autre erreur, peut-être que le PDF n'était finalement pas protégé
        if (error.name === 'InvalidPDFException') {
          setErreur("Fichier PDF invalide ou corrompu.");
        } else {
          setErreur("Erreur lors de la vérification.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isBloque = !!bloqueJusqua;
  const tentativesRestantes = 5 - tentatives;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-surface rounded-2xl p-6 w-full max-w-[480px] shadow-elevation-3 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
            <span className="material-symbols-outlined text-[24px]">lock</span>
          </div>
          <div className="overflow-hidden">
            <h2 className="text-title-md text-on-surface mb-1">Ce PDF est protégé</h2>
            <p className="text-body-sm text-on-surface-variant truncate" title={fichier?.name}>
              {fichier?.name || 'Fichier PDF'}
            </p>
          </div>
        </div>

        {/* Corps - Formulaire */}
        <form onSubmit={validerMotDePasse} className="mb-8">
          <div className="mb-2">
            <label className="block text-label-md text-on-surface mb-2">
              Mot de passe du document
            </label>
            <div className="relative">
              <input
                type={afficherMdp ? 'text' : 'password'}
                value={motDePasse}
                onChange={(e) => {
                  setMotDePasse(e.target.value);
                  setErreur(null);
                }}
                disabled={isBloque || isLoading}
                autoFocus
                placeholder="Saisissez le mot de passe"
                className={`w-full bg-surface-container-low border ${erreur ? 'border-error' : 'border-outline'} rounded-xl px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setAfficherMdp(!afficherMdp)}
                disabled={isBloque || isLoading}
                className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {afficherMdp ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-start min-h-[24px]">
            {erreur ? (
              <p className="text-label-sm text-error">{erreur}</p>
            ) : (
              <p className="text-label-sm text-transparent select-none">Espace réservé</p>
            )}
            
            {tentatives > 0 && !isBloque && (
              <p className="text-label-sm text-amber-600 text-right">
                {tentativesRestantes} tentative{tentativesRestantes > 1 ? 's' : ''} restante{tentativesRestantes > 1 ? 's' : ''}
              </p>
            )}
            {isBloque && (
              <p className="text-label-sm text-error text-right font-medium">
                Attendez {decompte}s
              </p>
            )}
          </div>
        </form>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={validerMotDePasse}
            disabled={!motDePasse || isBloque || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary rounded-xl py-3 px-4 text-label-lg font-label-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                Vérification...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">lock_open</span>
                Déverrouiller et continuer
              </>
            )}
          </button>
          
          <button
            onClick={onAnnuler}
            disabled={isLoading}
            className="w-full text-on-surface-variant hover:bg-surface-container rounded-xl py-3 px-4 text-label-lg font-label-bold transition-colors disabled:opacity-50"
          >
            Choisir un autre fichier
          </button>
        </div>

        {/* Lien tertiaire */}
        <div className="mt-6 text-center border-t border-outline-variant pt-4">
          <button
            onClick={onDevrouiller}
            disabled={isLoading}
            className="text-label-md text-primary hover:underline transition-all flex items-center justify-center gap-1 mx-auto"
          >
            Supprimer la protection de ce PDF
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
