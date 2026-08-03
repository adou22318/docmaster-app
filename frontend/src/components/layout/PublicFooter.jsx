import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter = () => {
  return (
    <footer className="bg-surface-container-low border-t-2 border-outline-variant w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex flex-col items-center md:items-start gap-4">
        <span className="font-headline-md text-primary">DocMaster</span>
        <p className="text-on-surface-variant font-label-sm max-w-xs text-center md:text-left">© 2024 PDF DocMaster. L'art du document technique.</p>
      </div>
      <nav className="flex flex-wrap justify-center gap-8">
        <Link className="text-on-surface-variant font-label-sm hover:text-secondary underline decoration-2 underline-offset-4 transition-all duration-200" to="/terms">Conditions</Link>
        <Link className="text-on-surface-variant font-label-sm hover:text-secondary underline decoration-2 underline-offset-4 transition-all duration-200" to="/privacy">Confidentialité</Link>
        <Link className="text-on-surface-variant font-label-sm hover:text-secondary underline decoration-2 underline-offset-4 transition-all duration-200" to="/api-docs">API</Link>
        <a className="text-on-surface-variant font-label-sm hover:text-secondary underline decoration-2 underline-offset-4 transition-all duration-200" href="mailto:contact@docmaster.tech">Contact</a>
      </nav>
      <div className="flex gap-4">
        <a className="w-10 h-10 flex items-center justify-center bg-on-surface/5 hover:bg-secondary-container transition-colors duration-200" href="#">
          <span className="material-symbols-outlined text-primary">language</span>
        </a>
        <a className="w-10 h-10 flex items-center justify-center bg-on-surface/5 hover:bg-secondary-container transition-colors duration-200" href="#">
          <span className="material-symbols-outlined text-primary">share</span>
        </a>
      </div>
    </footer>
  );
};
