import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { tools } from '../../data/tools';
import { PopularTools } from './PopularTools';
import { ToolRow } from './ToolRow';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const CATEGORIES = [
  { id: 'tous', label: 'Tous les outils' },
  { id: 'conversion', label: 'Conversion' },
  { id: 'organisation', label: 'Manipulation de pages' },
  { id: 'edition', label: 'Édition & Signature' },
  { id: 'securite', label: 'Sécurité & Compression' },
];

export const DashboardTools = () => {
  const [categorieActive, setCategorieActive] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const { ref: sectionRef, inView: sectionInView } = useScrollAnimation(0.1);

  const contentKey = `${categorieActive}-${searchQuery}`;

  // ─── FILTRAGE INSTANTANÉ ─────────────────────────────────────────────
  const filteredTools = useMemo(() => {
    let result = tools;

    if (categorieActive !== 'tous') {
      result = result.filter((t) => t.categorie === categorieActive);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) => t.nom.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [categorieActive, searchQuery]);

  // ─── CARTE D'OUTIL ──────────────────────────────────────────────────
  const renderToolCard = (tool) => {
    const isPrimary = tool.couleur === 'primary';
    const isAccent = tool.couleur === 'accent';

    return (
      <Link
        key={tool.id}
        to={tool.route}
        className={`rounded-2xl p-8 flex gap-6 hover:-translate-y-1 transition-transform cursor-pointer group h-full ${
          isPrimary
            ? 'bg-primary text-on-primary shadow-md hover:shadow-lg'
            : isAccent
            ? 'bg-surface-container-lowest border-2 border-secondary-fixed-dim shadow-sm'
            : 'bg-surface-container-lowest border border-outline-variant hover:border-secondary shadow-sm'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            isPrimary ? 'bg-on-primary-fixed-variant/20' : 'bg-secondary-container'
          }`}
        >
          <span
            className={`material-symbols-outlined ${
              isPrimary ? 'text-on-primary' : 'text-on-secondary-container'
            }`}
          >
            {tool.icone}
          </span>
        </div>
        <div>
          <h4 className="font-headline-md text-body-lg mb-1 group-hover:text-secondary transition-colors">
            {tool.nom}
          </h4>
          <p
            className={`text-label-sm ${
              isPrimary ? 'opacity-70' : 'text-on-surface-variant'
            }`}
          >
            {tool.description}
          </p>
        </div>
      </Link>
    );
  };

  // ─── DÉCOUPE EN RANGÉES DE 4 POUR L'ANIMATION ───────────────────────
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  // ─── RENDU HYBRIDE ───────────────────────────────────────────────────
  const renderContent = () => {
    if (filteredTools.length === 0) {
      return (
        <div className="py-12 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
          <h3 className="font-display-xl text-title-lg text-on-surface mb-2">Aucun outil trouvé</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mb-6">
            Aucun outil ne correspond à « {searchQuery} » dans la catégorie sélectionnée.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategorieActive('tous');
            }}
            className="px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-bold hover:bg-secondary hover:text-on-secondary transition-colors"
          >
            Réinitialiser la recherche
          </button>
        </div>
      );
    }

    // Affichage groupé si "Tous" est actif
    if (categorieActive === 'tous') {
      const grouped = CATEGORIES.slice(1).map((cat) => ({
        ...cat,
        items: filteredTools.filter((t) => t.categorie === cat.id),
      }));

      return (
        <div key={contentKey} className="space-y-12">
          {grouped.map((group) => {
            if (group.items.length === 0) return null;
            return (
              <CategoryGroup key={group.id} label={group.label} items={group.items} renderToolCard={renderToolCard} chunkArray={chunkArray} />
            );
          })}
        </div>
      );
    }

    // Affichage en rangées si catégorie spécifique
    const rows = chunkArray(filteredTools, 4);
    return (
      <div key={contentKey} className="space-y-6">
        {rows.map((row, rowIndex) => (
          <ToolRow key={rowIndex}>
            {row.map((tool) => renderToolCard(tool))}
          </ToolRow>
        ))}
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="space-y-6">
      {/* En-tête : Titre et Recherche — animate-fade */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade ${sectionInView ? 'visible' : ''}`}>
        <div>
          <h2 className="font-display-xl text-headline-md text-primary">Boîte à outils</h2>
        </div>
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Rechercher un outil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-full border border-outline-variant bg-surface hover:border-secondary focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-error transition-colors flex items-center justify-center"
              title="Effacer la recherche"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Barre d'onglets */}
      <div className={`border-b border-outline-variant flex gap-8 overflow-x-auto custom-scrollbar animate-fade ${sectionInView ? 'visible' : ''}`}>
        {CATEGORIES.map((cat) => {
          const isActive = categorieActive === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategorieActive(cat.id)}
              className={`pb-4 px-2 font-label-bold text-label-sm whitespace-nowrap transition-colors border-b-2 ${
                isActive
                  ? 'border-secondary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary hover:border-outline'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Outils Populaires (affichés uniquement si "Tous" et aucune recherche) */}
      {categorieActive === 'tous' && searchQuery.trim() === '' && <PopularTools />}

      {/* Contenu principal (Grille ou Groupes) */}
      {renderContent()}
    </section>
  );
};

/**
 * Composant interne pour un groupe de catégorie.
 * Utilise son propre useScrollAnimation pour le titre et ToolRow pour les cartes.
 */
const CategoryGroup = ({ label, items, renderToolCard, chunkArray }) => {
  const { ref, inView } = useScrollAnimation(0.1);
  const rows = chunkArray(items, 4);

  return (
    <div ref={ref}>
      {/* Titre de catégorie : animate-fade */}
      <div className={`flex items-center gap-4 mb-6 animate-fade ${inView ? 'visible' : ''}`}>
        <h3 className="font-display-xl text-title-lg text-primary">{label}</h3>
        <div className="h-px bg-outline-variant flex-grow"></div>
      </div>
      {/* Cartes par rangées */}
      <div className="space-y-6">
        {rows.map((row, rowIndex) => (
          <ToolRow key={rowIndex}>
            {row.map((tool) => renderToolCard(tool))}
          </ToolRow>
        ))}
      </div>
    </div>
  );
};
