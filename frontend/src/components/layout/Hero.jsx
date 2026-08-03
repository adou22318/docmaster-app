import React from 'react';

export const Hero = () => {
  return (
    <section className="py-20 bg-base text-center">
      <div className="max-w-4xl mx-auto px-6">
        <div className="inline-block bg-surface px-4 py-1 rounded-sm text-sm font-bold text-main uppercase tracking-wider mb-8">
          Plus de 35 outils PDF avancés
        </div>
        
        {/* Titre franc, sans dégradé */}
        <h1 className="text-[56px] leading-[1.1] font-bold text-main mb-6 tracking-tight">
          Tous vos documents PDF,<br />
          simplifiés en un seul outil.
        </h1>
        
        <p className="text-xl text-muted max-w-2xl mx-auto mb-12">
          Convertissez, modifiez, signez et sécurisez vos PDF. Une expérience fluide, rapide et professionnelle, basée sur la simplicité.
        </p>

        {/* Stats textuelles, alignement strict */}
        <div className="flex justify-center items-center gap-8 text-sm font-medium text-muted">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-main rounded-none mr-2"></span>
            2M+ utilisateurs
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-main rounded-none mr-2"></span>
            Crypto TLS 256 bits
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-main rounded-none mr-2"></span>
            Traitement instantané
          </span>
        </div>
      </div>
    </section>
  );
};
