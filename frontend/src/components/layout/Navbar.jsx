import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-base border-b border-surface">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo - Objectif et clair, sans dégradé */}
        <Link to="/" className="text-2xl font-bold text-main tracking-tight">
          DocMaster<span className="font-normal text-muted">Suite</span>
        </Link>

        {/* Liens et actions */}
        <nav className="flex items-center space-x-6">
          <Link to="/tools" className="text-muted hover:text-main font-medium transition-colors">
            Outils
          </Link>
          <Link to="/pricing" className="text-muted hover:text-main font-medium transition-colors">
            Tarifs
          </Link>
          
          <div className="flex items-center space-x-4 pl-4 border-l border-surface">
            <Link to="/login" className="flex items-center text-main font-medium hover:text-accent transition-colors">
              <User className="w-5 h-5 mr-2" />
              Connexion
            </Link>
            <Link to="/signup" className="bg-main text-base px-5 py-2 rounded-sm font-medium hover:bg-black transition-colors">
              Essai gratuit
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
