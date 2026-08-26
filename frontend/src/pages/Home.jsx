import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  const currentYear = new Date().getFullYear();
  useEffect(() => {
    // Micro-interactions and subtle scroll effects
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-8');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.editorial-shadow').forEach(el => {
        el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-8');
        observer.observe(el);
    });
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[921px] flex items-center px-margin-mobile md:px-margin-desktop py-20 overflow-hidden">
        <div className="container-max mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          {/* Content */}
          <div className="md:col-span-7 z-10">
            <div className="mb-6 inline-block bg-secondary-container/10 px-4 py-1 rounded-full">
              <span className="font-label-bold text-secondary uppercase tracking-widest text-[10px]">Édition Technique {currentYear}</span>
            </div>
            <h1 className="font-display-xl text-display-xl md:text-[80px] leading-[0.95] text-primary mb-8 max-w-2xl">
                L'art du document, <span className="text-secondary">maîtrisé.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-lg">
                Plus qu'un utilitaire, un atelier numérique pour vos documents techniques. Alliez la précision artisanale à la puissance industrielle du PDF.
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <Link to="/register" className="bg-primary text-surface px-10 py-5 font-label-bold transition-all hover:bg-secondary-container hover:text-primary active:scale-95">
                  Démarrer gratuitement
              </Link>
              <a href="#features" className="font-label-bold text-secondary border-b-[3px] border-secondary-container/30 hover:border-secondary-container transition-all py-1">
                  Découvrir nos modules
              </a>
            </div>
          </div>
          {/* Abstract Illustration */}
          <div className="md:col-span-5 relative mt-12 md:mt-0">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl"></div>
            <div className="relative w-full aspect-[4/5] bg-surface-container-high editorial-shadow flex items-center justify-center p-unit ink-texture overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
              <div className="w-full h-full border-[1px] border-outline-variant p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-1 bg-primary"></div>
                  <span className="font-display-xl text-headline-md text-secondary">01</span>
                </div>
                <div className="relative h-64 w-full">
                  <div className="absolute top-0 left-0 w-full h-full border-[2px] border-primary group-hover:rotate-3 transition-transform duration-500"></div>
                  <div className="absolute top-4 left-4 w-full h-full border-[2px] border-secondary group-hover:-rotate-3 transition-transform duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[80px] text-primary group-hover:scale-110 transition-transform duration-500" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24" }}>description</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-[2px] bg-outline-variant"></div>
                  <div className="w-2/3 h-[2px] bg-outline-variant"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-surface-container-low py-32 px-margin-mobile md:px-margin-desktop ink-texture">
        <div className="container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-xl">
              <h2 className="font-display-xl text-headline-lg mb-6">Des outils taillés pour l'exigence technique.</h2>
              <p className="font-body-md text-on-surface-variant">Quatre modules autonomes conçus pour respecter l'intégrité de vos données tout en sublimant leur présentation.</p>
            </div>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-surface transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-surface transition-colors">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Conversion */}
            <div className="md:col-span-4 bg-surface p-10 border border-outline-variant group hover:border-secondary transition-all hover:-translate-y-1 editorial-shadow flex flex-col justify-between h-[400px]">
              <div>
                <span className="material-symbols-outlined text-[40px] text-primary mb-6 group-hover:text-secondary-container transition-colors">sync_alt</span>
                <h3 className="font-headline-md mb-4">Conversion</h3>
                <p className="font-body-md text-on-surface-variant">Transformez vos plans, graphiques et rapports sans aucune perte de vectorisation.</p>
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-outline-variant/30">
                <span className="font-label-bold text-secondary uppercase text-[10px]">Précision Absolue</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">east</span>
              </div>
            </div>
            {/* Manipulation */}
            <div className="md:col-span-8 bg-primary p-10 group hover:bg-primary-container transition-all hover:-translate-y-1 editorial-shadow flex flex-col justify-between h-[400px] text-surface">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="md:w-1/2">
                  <span className="material-symbols-outlined text-[40px] text-secondary-container mb-6">extension</span>
                  <h3 className="font-headline-md mb-4 text-surface">Manipulation</h3>
                  <p className="font-body-md text-surface/70">Fusionnez, divisez et réorganisez vos documents avec une fluidité architecturale.</p>
                </div>
                <div className="md:w-1/2 relative hidden md:block">
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 p-4">
                    <div className="flex gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                      <div className="w-3 h-3 rounded-full bg-outline"></div>
                      <div className="w-3 h-3 rounded-full bg-outline"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 w-full bg-white/10"></div>
                      <div className="h-2 w-3/4 bg-white/10"></div>
                      <div className="h-12 w-full bg-secondary-container/20 border border-secondary-container/40"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-white/10">
                <span className="font-label-bold text-secondary-container uppercase text-[10px]">Structure Agile</span>
                <span className="material-symbols-outlined text-secondary-container group-hover:translate-x-2 transition-transform">east</span>
              </div>
            </div>
            {/* Protection */}
            <div className="md:col-span-7 bg-surface p-10 border border-outline-variant group hover:border-secondary transition-all hover:-translate-y-1 editorial-shadow flex flex-col justify-between h-[400px]">
              <div className="flex gap-10 items-center">
                <div className="w-1/2">
                  <span className="material-symbols-outlined text-[40px] text-primary mb-6 group-hover:text-secondary-container transition-colors">lock</span>
                  <h3 className="font-headline-md mb-4">Protection</h3>
                  <p className="font-body-md text-on-surface-variant">Chiffrement de niveau industriel et gestion fine des autorisations de lecture.</p>
                </div>
                <div className="w-1/2 h-full min-h-[200px]">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 rounded-lg" alt="Protection abstract" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPantnLEXDSt2wJaERtE3OAd6tT2hOYzt3JcFDG1qXHOGhMv9YFsTNlqbdcF27zTszWS1xlHjsWYFhHGNwzOAIZe_6bZHAfBq0lwp4GcZLPWZfhsgRYddDD6YelJb92xfChSnJZ7vQlhMww5fYk9HxTS1hEIZLNSUsnycVlpu1iXtKzA16qo-TL3nSE6qoIc8tTZ0ieOVuIy3EsI2Yr1R4EEDadEV9nUI5fyV6WmMLELWaFaiUASBaHw"/>
                </div>
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-outline-variant/30 mt-4">
                <span className="font-label-bold text-secondary uppercase text-[10px]">Confidentialité Native</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">east</span>
              </div>
            </div>
            {/* Signature */}
            <div className="md:col-span-5 bg-secondary-container p-10 group transition-all hover:-translate-y-1 editorial-shadow flex flex-col justify-between h-[400px] text-primary">
              <div>
                <span className="material-symbols-outlined text-[40px] text-primary mb-6">history_edu</span>
                <h3 className="font-headline-md mb-4">Signature</h3>
                <p className="font-body-md text-primary/80">Validez vos échanges avec une signature électronique légalement certifiée et esthétiquement pure.</p>
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-primary/20">
                <span className="font-label-bold text-primary uppercase text-[10px]">Valeur Légale</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">east</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop text-center bg-surface relative overflow-hidden">
        <div className="absolute -left-20 top-0 opacity-5 pointer-events-none">
          <span className="font-display-xl text-[200px] leading-none select-none">BAMAKO</span>
        </div>
        <div className="container-max mx-auto max-w-4xl relative z-10">
          <span className="material-symbols-outlined text-secondary text-[48px] mb-8" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <h2 className="font-display-xl text-headline-lg mb-8 italic">"La rigueur d'un ingénieur, l'œil d'un éditeur."</h2>
          <p className="font-body-lg text-on-surface-variant mb-12">
              Développé avec passion à MALI DEVELOPPEUR SARL, DocMaster respecte les normes les plus strictes en matière de souveraineté des données. Aucun de vos documents ne transite par des serveurs tiers sans votre consentement explicite.
          </p>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
            <span className="font-headline-md">ISO 27001</span>
            <span className="font-headline-md">RGPD Compliant</span>
            <span className="font-headline-md">eIDAS Certified</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-primary text-surface ink-texture relative">
        <div className="container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="max-w-2xl">
            <h2 className="font-display-xl text-headline-lg-mobile md:text-headline-lg mb-4 text-surface">Prêt à transformer vos documents ?</h2>
            <p className="font-body-md text-surface/70">Rejoignez des milliers d'experts qui ont choisi l'excellence éditoriale pour leurs dossiers techniques.</p>
          </div>
          <Link to="/register" className="bg-secondary-container text-primary px-12 py-6 font-label-bold hover:scale-105 active:scale-95 transition-all shadow-xl">
              Démarrer gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
};
