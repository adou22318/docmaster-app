import React from 'react';
import { Link } from 'react-router-dom';
import { tools } from '../../data/tools';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export const PopularTools = () => {
  const popularTools = tools.filter((t) => t.populaire);
  const { ref, inView } = useScrollAnimation(0.1);

  if (popularTools.length === 0) return null;

  return (
    <div className="mb-10" ref={ref}>
      {/* Titre : animate-fade */}
      <div className={`flex items-center gap-4 mb-6 animate-fade ${inView ? 'visible' : ''}`}>
        <h3 className="font-display-xl text-title-lg text-primary whitespace-nowrap">Les plus utilisés</h3>
        <div className="h-px bg-outline-variant flex-grow"></div>
      </div>

      {/* Cartes : animate-fade-up en cascade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularTools.map((tool, i) => {
          const isPrimary = tool.couleur === 'primary';

          return (
            <div
              key={tool.id}
              className={`animate-fade-up delay-${Math.min(i, 5)} ${inView ? 'visible' : ''}`}
            >
              <Link
                to={tool.route}
                className={`rounded-2xl p-8 flex flex-col justify-between group hover:-translate-y-1 transition-all min-h-[200px] h-full ${
                  isPrimary
                    ? 'bg-primary text-on-primary shadow-md hover:shadow-lg'
                    : 'bg-surface border border-outline-variant hover:border-secondary shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isPrimary ? 'bg-on-primary-fixed-variant/20' : 'bg-secondary-container/20'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-2xl ${
                          isPrimary ? 'text-on-primary' : 'text-secondary'
                        }`}
                      >
                        {tool.icone}
                      </span>
                    </div>
                    <span
                      className={`material-symbols-outlined text-sm ${
                        isPrimary ? 'text-on-primary/50' : 'text-secondary'
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </div>
                  <h4 className="font-headline-md text-body-lg mb-2">{tool.nom}</h4>
                  <p
                    className={`text-label-sm line-clamp-2 ${
                      isPrimary ? 'opacity-70' : 'text-on-surface-variant'
                    }`}
                  >
                    {tool.description}
                  </p>
                </div>
                <div className={`flex justify-between items-center pt-6 mt-4 border-t ${
                  isPrimary ? 'border-on-primary/10' : 'border-outline-variant/30'
                }`}>
                  <span className={`font-label-bold uppercase text-[10px] tracking-wider ${
                    isPrimary ? 'text-on-primary/60' : 'text-secondary'
                  }`}>
                    Populaire
                  </span>
                  <span className={`material-symbols-outlined group-hover:translate-x-2 transition-transform ${
                    isPrimary ? 'text-on-primary/60' : 'text-on-surface-variant'
                  }`}>east</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
