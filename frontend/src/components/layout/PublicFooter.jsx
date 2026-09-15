import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const getLinkClass = (path, currentPath) => {
  const isActive = currentPath === path;
  return `font-label-sm transition-all duration-200 ${
    isActive 
      ? 'text-primary font-label-bold underline decoration-2 underline-offset-4' 
      : 'text-on-surface-variant hover:text-secondary underline decoration-2 underline-offset-4'
  }`;
};

export const PublicFooter = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  return (
    <footer className="bg-surface-container-low border-t-2 border-outline-variant w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex flex-col items-center md:items-start gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-secondary-container rounded flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          </div>
          <span className="font-headline-md text-primary">DocMaster</span>
        </div>
        <p className="text-on-surface-variant font-label-sm max-w-xs text-center md:text-left">
          © {currentYear} PDF DocMaster — Projet ENI-ABT G.I.T.
        </p>
        <p className="text-on-surface-variant/70 font-label-sm max-w-xs text-center md:text-left text-[11px]">
          Traitement local · Suppression 24h · Projet ENI-ABT
        </p>
      </div>
      <nav className="flex flex-wrap justify-center gap-8">
        <Link className={getLinkClass('/pricing', location.pathname)} to="/pricing">Tarifs</Link>
        <Link className={getLinkClass('/help', location.pathname)} to="/help">Aide</Link>
        <Link className={getLinkClass('/terms', location.pathname)} to="/terms">Conditions</Link>
        <Link className={getLinkClass('/privacy', location.pathname)} to="/privacy">Confidentialité</Link>
        <a className="text-on-surface-variant font-label-sm hover:text-secondary underline decoration-2 underline-offset-4 transition-all duration-200" href="mailto:contact@docmaster.tech">Contact</a>
      </nav>
    </footer>
  );
};
