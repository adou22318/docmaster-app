import React from 'react';

export const FreePage = () => {
  return (
    <div className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop min-h-[calc(100vh-100px)]">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-block bg-secondary-container/20 px-4 py-1.5 rounded-full mb-4">
            <span className="font-label-bold text-secondary uppercase tracking-widest text-[12px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
              Open Source & Gratuit
            </span>
          </div>
          <h1 className="font-display-xl text-display-md text-primary">Un accès 100% Libre</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            PDF DocMaster a été conçu dans le cadre d'un projet de soutenance (G.I.T ENI-ABT). 
            À ce titre, l'intégralité de la plateforme est accessible gratuitement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant hover:border-secondary transition-colors group">
            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px] text-primary">check_circle</span>
            </div>
            <h2 className="font-display-xl text-headline-sm text-on-surface mb-4">Ce qui est inclus</h2>
            <ul className="space-y-4">
              {['Tous les outils de traitement PDF', 'Stockage temporaire sécurisé (24h)', 'Espace de travail personnalisé', 'Signature électronique simple'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">done</span>
                  <span className="text-body-md text-on-surface-variant">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant hover:border-error transition-colors group">
            <div className="w-16 h-16 rounded-2xl bg-error-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px] text-error">block</span>
            </div>
            <h2 className="font-display-xl text-headline-sm text-on-surface mb-4">Ce qui n'y est pas</h2>
            <ul className="space-y-4">
              {['Abonnements payants', 'Publicités intrusives', 'Revente de vos données', 'Limites artificielles de fichiers'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-error text-[20px] mt-0.5">close</span>
                  <span className="text-body-md text-on-surface-variant">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
