import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const AppFooter = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path
      ? 'text-primary font-label-bold'
      : 'hover:text-primary transition-colors';
  };

  return (
    <footer className="bg-surface border-t border-outline-variant py-8 px-margin-desktop mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-on-surface-variant font-label-sm">
        <p className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">copyright</span>
          {currentYear} PDF DocMaster (Projet ENI-ABT).
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link to="/free" className={getLinkClass('/free')}>Accès Libre</Link>
          <Link to="/help" className={getLinkClass('/help')}>Aide</Link>
          <Link to="/terms" className={getLinkClass('/terms')}>Conditions</Link>
          <Link to="/privacy" className={getLinkClass('/privacy')}>Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
};
