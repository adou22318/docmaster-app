import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const PublicHeader = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();
  const navigate = useNavigate();

  // Déterminer l'état de connexion :
  // - Si auth terminée → utiliser user
  // - Si auth en cours → inférer depuis la présence du refreshToken localStorage
  //   (évite le flash "Connexion/Inscription" chez les utilisateurs connectés)
  const hasRefreshToken = typeof window !== 'undefined' && !!localStorage.getItem('refreshToken');
  const isAuthenticated = isLoading ? hasRefreshToken : !!user;

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `font-label-bold transition-colors duration-200 ${
      isActive
        ? 'text-primary border-b-2 border-primary py-1'
        : 'text-on-surface-variant hover:text-primary'
    }`;
  };

  // Scroll doux vers #features sans rechargement de page
  const handleFeaturesClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      // Laisser le temps à la page d'accueil de se monter, puis scroller
      setTimeout(() => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-surface shadow-[0_4px_40px_rgba(26,28,30,0.08)] docked full-width top-0 flex justify-between items-center w-full px-margin-desktop h-20 z-50 fixed">
      <div className="flex items-center gap-4">
        <Link className="font-display-xl text-headline-md text-primary flex items-center gap-2" to="/">
          <div className="w-8 h-8 bg-secondary-container rounded flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          </div>
          <span className="hidden md:block">DocMaster</span>
        </Link>
      </div>

      <nav className="hidden md:flex gap-8 items-center h-full">
        <Link className={getLinkClass('/')} to="/">Accueil</Link>
        <a
          className="text-on-surface-variant font-label-bold hover:text-primary transition-colors duration-200 cursor-pointer"
          onClick={handleFeaturesClick}
          href="/#features"
        >
          Fonctionnalités
        </a>
        <Link className={getLinkClass('/pricing')} to="/pricing">Tarifs</Link>
        <Link className={getLinkClass('/help')} to="/help">Aide</Link>
      </nav>

      <div className="flex items-center gap-6 min-w-[160px] justify-end">
        {isLoading && !hasRefreshToken ? (
          // Auth en cours + pas de token → skeleton neutre
          <div className="w-28 h-9 rounded-xl bg-surface-container animate-pulse" />
        ) : isAuthenticated ? (
          <Link
            className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
            to="/dashboard">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Mon Atelier
          </Link>
        ) : (
          <>
            <Link className="font-label-bold text-on-surface-variant hover:text-primary transition-colors" to="/login">
              Connexion
            </Link>
            <Link className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label-bold hover:bg-primary/90 transition-all shadow-sm" to="/register">
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </header>
  );
};
