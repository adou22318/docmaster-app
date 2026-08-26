import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const PublicHeader = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `font-label-bold transition-colors duration-200 ${
      isActive 
        ? 'text-secondary-container border-b-2 border-secondary-container py-1' 
        : 'text-on-surface-variant hover:text-secondary-fixed-dim'
    }`;
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
        <a className="text-on-surface-variant font-label-bold hover:text-secondary-fixed-dim transition-colors duration-200" href="/#features">Fonctionnalités</a>
        <Link className={getLinkClass('/free')} to="/free">Accès Libre</Link>
        <Link className={getLinkClass('/help')} to="/help">Aide</Link>
      </nav>
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <Link className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2" to="/dashboard">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Mon Atelier
          </Link>
        ) : (
          <>
            <Link className="font-label-bold text-on-surface-variant hover:text-primary transition-colors" to="/login">Connexion</Link>
            <Link className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label-bold hover:bg-primary/90 transition-all shadow-sm" to="/register">S'inscrire</Link>
          </>
        )}
      </div>
    </header>
  );
};
