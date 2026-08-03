import React from 'react';

export const PricingCard = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 mb-20">
      <div className="bg-base border border-surface p-12 text-center rounded-sm">
        <div className="inline-block bg-surface px-4 py-1 rounded-sm text-xs font-bold text-main uppercase tracking-wider mb-6">
          Freemium puissant
        </div>
        
        <h3 className="text-3xl font-bold text-main mb-10 tracking-tight">Gratuit, Pro ou Équipe</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="p-6 border border-surface">
            <strong className="block text-xl mb-2">Gratuit</strong>
            <span className="text-muted text-sm">2 tâches/heure<br />10 Mo max</span>
          </div>
          <div className="p-6 border-2 border-main bg-surface relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-main text-base text-xs font-bold px-3 py-1 uppercase tracking-wider">
              Populaire
            </span>
            <strong className="block text-xl mb-2">Pro</strong>
            <span className="text-muted text-sm">9€/mois<br />Illimité + lots</span>
          </div>
          <div className="p-6 border border-surface">
            <strong className="block text-xl mb-2">Équipe</strong>
            <span className="text-muted text-sm">7€/utilisateur<br />Collaboration</span>
          </div>
        </div>
      </div>
    </div>
  );
};
