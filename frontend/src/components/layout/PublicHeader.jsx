import React from 'react';
import { Link } from 'react-router-dom';

export const PublicHeader = () => {
  return (
    <header className="bg-surface shadow-[0_4px_40px_rgba(26,28,30,0.08)] docked full-width top-0 flex justify-between items-center w-full px-margin-desktop h-20 z-50 fixed">
      <div className="flex items-center gap-4">
        <Link className="font-display-xl text-headline-md text-primary" to="/">DocMaster</Link>
      </div>
      <nav className="hidden md:flex gap-8">
        <Link className="text-secondary-container font-label-bold border-b-2 border-secondary-container transition-colors duration-200" to="/">Accueil</Link>
        <a className="text-on-surface-variant font-label-bold hover:text-secondary-fixed-dim transition-colors duration-200" href="/#features">Fonctionnalités</a>
        <Link className="text-on-surface-variant font-label-bold hover:text-secondary-fixed-dim transition-colors duration-200" to="/pricing">Tarifs</Link>
        <Link className="text-on-surface-variant font-label-bold hover:text-secondary-fixed-dim transition-colors duration-200" to="/help">Aide</Link>
      </nav>
      <div className="flex items-center gap-6">
        <Link className="font-label-bold text-on-surface-variant hover:text-primary transition-colors" to="/login">Connexion</Link>
        <Link className="bg-primary text-on-primary px-6 py-2 font-label-bold hover:bg-secondary-container hover:text-on-secondary-container transition-all" to="/register">S'inscrire</Link>
      </div>
    </header>
  );
};
