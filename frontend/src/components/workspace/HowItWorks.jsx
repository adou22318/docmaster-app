import React from 'react';

/**
 * Section "Comment utiliser cet outil" — affiche les étapes numérotées.
 * Hiérarchie visuelle claire : numéro > titre (gras, on-surface) > description (on-surface-variant)
 */
const HowItWorks = ({ etapes, conseil }) => {
  return (
    <section className="mt-12 pt-8 border-t border-outline-variant" aria-label="Comment utiliser cet outil">
      <h2 className="text-headline-md font-headline-lg text-on-surface mb-6 flex items-center gap-2">
        <span
          className="material-symbols-outlined text-[22px] text-secondary-container bg-primary rounded-lg p-1"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_stories
        </span>
        Comment utiliser cet outil ?
      </h2>

      <ol className="space-y-0" aria-label="Étapes d'utilisation">
        {etapes.map((etape, index) => (
          <li key={index} className="flex gap-4 items-stretch group">
            {/* Colonne gauche : numéro + ligne de connexion */}
            <div className="flex flex-col items-center">
              {/* Badge numéro */}
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center
                font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {index + 1}
              </div>
              {/* Ligne verticale entre les étapes (sauf la dernière) */}
              {index < etapes.length - 1 && (
                <div className="w-px flex-1 mt-2 mb-1 bg-outline-variant" />
              )}
            </div>

            {/* Colonne droite : texte */}
            <div className={`flex-1 pb-5 ${index < etapes.length - 1 ? '' : 'pb-0'}`}>
              {/* Titre de l'étape — gras, couleur primaire, clairement distinct */}
              <h3 className="text-base font-bold text-on-surface leading-tight mb-1">
                {etape.titre}
              </h3>
              {/* Description — couleur atténuée, taille légèrement plus petite */}
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {etape.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {conseil && (
        <div className="mt-6 flex items-start gap-3 p-4 bg-secondary-container/20 border border-secondary-container/40 rounded-xl">
          <span
            className="material-symbols-outlined text-[18px] text-secondary mt-0.5 shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lightbulb
          </span>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            <span className="font-semibold text-on-surface">Conseil&nbsp;: </span>
            {conseil}
          </p>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;
