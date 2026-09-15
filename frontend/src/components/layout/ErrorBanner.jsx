import React, { useEffect, useState } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export const ErrorBanner = ({ message, onDismiss, autoDismissTime = 8000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { ref, inView } = useScrollAnimation(0);

  useEffect(() => {
    if (autoDismissTime > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissTime);
      return () => clearTimeout(timer);
    }
  }, [autoDismissTime]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      // Un petit délai pour laisser l'animation se terminer
      setTimeout(onDismiss, 300);
    }
  };

  if (!message || !isVisible) return null;

  return (
    <>
      {/* Overlay pour fermer au clic à l'extérieur, masqué visuellement mais cliquable si on veut. 
          Le PRD demande "fermeture clic extérieur (si modal)". Ici c'est un banner, 
          généralement on clique à côté et ça ferme. */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={handleDismiss}
        style={{ background: 'transparent' }}
      ></div>
      
      <div ref={ref} className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-scale ${inView ? 'visible' : ''}`}>
        <div className="bg-error-container text-error rounded-xl p-4 shadow-lg flex items-start gap-3 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
          <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
          <div className="flex-grow">
            <h4 className="font-label-bold text-label-lg mb-1">Erreur</h4>
            <p className="text-body-sm opacity-90 whitespace-pre-wrap">{message}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="p-1 hover:bg-error/10 rounded-lg transition-colors shrink-0"
            title="Fermer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>
    </>
  );
};
