import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Page de transition pour le retour OAuth Google.
 * 
 * Lit les tokens directement depuis window.location.search (plus fiable
 * que useSearchParams pour les JWT qui contiennent des caractères spéciaux).
 * 
 * Utilise un ref pour s'assurer que le traitement ne s'exécute qu'une seule fois,
 * même si React re-rend le composant en mode StrictMode.
 */
export const AuthCallback = () => {
  const navigate = useNavigate();
  const setTokensFromOAuth = useAuthStore((state) => state.setTokensFromOAuth);
  const processed = useRef(false);

  useEffect(() => {
    // Empêcher le double traitement (React StrictMode)
    if (processed.current) return;
    processed.current = true;

    // Lecture directe des paramètres d'URL (évite les problèmes d'encodage de useSearchParams)
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      // Injecter les tokens dans le store et le localStorage
      setTokensFromOAuth(accessToken, refreshToken);
      
      // Nettoyer l'URL des tokens sensibles avant de naviguer
      // On utilise window.history.replaceState pour effacer les tokens de l'historique
      window.history.replaceState({}, '', '/auth/callback');
      
      // Petite pause pour laisser l'animation de chargement s'afficher
      // Cela rend la transition plus naturelle et moins "buggée/abrupte"
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    } else {
      // Aucun token — échec OAuth
      navigate('/login', { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-secondary-container rounded flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
        </div>
        <p className="font-label-bold text-primary animate-pulse tracking-widest uppercase">Connexion sécurisée en cours...</p>
      </div>
    </div>
  );
};
