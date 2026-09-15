import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Page 404 — URL non trouvée.
 * Affiche deux boutons selon l'état de connexion :
 * - Connecté → "Aller au Dashboard"
 * - Non connecté → "Retour à l'accueil"
 */
export const NotFoundPage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Grand chiffre décoratif */}
      <div className="relative mb-8 select-none">
        <span
          className="text-[180px] font-black text-primary/8 leading-none block"
          style={{ fontFamily: 'Syne, sans-serif' }}
          aria-hidden="true"
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[72px] text-primary"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
          >
            travel_explore
          </span>
        </div>
      </div>

      {/* Texte */}
      <h1 className="font-display-xl text-headline-lg text-on-surface mb-3">
        Page introuvable
      </h1>
      <p className="text-body-lg text-on-surface-variant max-w-md mb-10">
        La page que vous cherchez n'existe pas ou a été déplacée. Vérifiez l'URL ou retournez à un endroit sûr.
      </p>

      {/* Boutons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-2xl bg-primary text-on-primary font-label-bold text-label-lg hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Aller à l'atelier
            </Link>
            <Link
              to="/"
              className="px-8 py-3.5 rounded-2xl border border-outline-variant text-on-surface font-label-bold text-label-lg hover:bg-surface-container transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              Accueil
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/"
              className="px-8 py-3.5 rounded-2xl bg-primary text-on-primary font-label-bold text-label-lg hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              Retour à l'accueil
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-2xl border border-outline-variant text-on-surface font-label-bold text-label-lg hover:bg-surface-container transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Se connecter
            </Link>
          </>
        )}
      </div>

      {/* Logo discret en bas */}
      <p className="mt-16 text-label-sm text-on-surface-variant opacity-60">
        PDF DocMaster
      </p>
    </div>
  );
};
