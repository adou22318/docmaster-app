/**
 * UnifiedFooter — composant partagé par PublicLayout, AppLayout et PricingPage.
 * Gère automatiquement les liens selon l'état d'authentification.
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.js';

export const UnifiedFooter = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isConnected = !!user;

  const linkClass = (path) => {
    const isActive = location.pathname === path;
    return `text-xs transition-colors duration-200 ${
      isActive
        ? 'text-primary font-semibold'
        : 'text-on-surface-variant hover:text-on-surface'
    }`;
  };

  return (
    <footer className="bg-surface border-t border-outline-variant w-full">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Logo + Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-secondary-container rounded flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            </div>
            <span className="text-sm font-semibold text-primary">DocMaster</span>
          </div>
          <p className="text-xs text-on-surface-variant/70">
            © {currentYear} PDF DocMaster — Projet ENI-ABT G.I.T.
          </p>
          <p className="text-[11px] text-on-surface-variant/50">
            Traitement local · Suppression manuelle
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {isConnected ? (
            <Link to="/dashboard" className={linkClass('/dashboard')}>Mon Atelier</Link>
          ) : null}
          <Link to="/pricing" className={linkClass('/pricing')}>Tarifs</Link>
          <Link to="/help" className={linkClass('/help')}>Aide</Link>
          <Link to="/terms" className={linkClass('/terms')}>Conditions</Link>
          <Link to="/privacy" className={linkClass('/privacy')}>Confidentialité</Link>
          <a href="mailto:contact@docmaster.tech"
            className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
            Contact
          </a>
        </nav>

      </div>
    </footer>
  );
};
