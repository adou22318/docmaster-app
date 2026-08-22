import React, { useState } from 'react';
import { traduireSelection } from '../../../utils/formatters';

/**
 * WatermarkOptions — Panneau latéral pour l'outil Filigrane
 * Grille 3x3 visuelle pour la position, sliders, color picker,
 * et prévisualisation CSS en temps réel.
 */

const POSITIONS = [
  { id: 'haut-gauche',  label: '↖', row: 0, col: 0 },
  { id: 'haut-centre',  label: '↑', row: 0, col: 1 },
  { id: 'haut-droite',  label: '↗', row: 0, col: 2 },
  { id: 'centre',       label: '●', row: 1, col: 1 },
  { id: 'bas-gauche',   label: '↙', row: 2, col: 0 },
  { id: 'bas-centre',   label: '↓', row: 2, col: 1 },
  { id: 'bas-droite',   label: '↘', row: 2, col: 2 },
];

export const WatermarkOptions = ({ onStart, isProcessing, selection = [], totalPages }) => {
  const [texte, setTexte] = useState('CONFIDENTIEL');
  const [position, setPosition] = useState('centre');
  const [opacite, setOpacite] = useState(30);    // 0-100 → envoyé en 0-1 au backend
  const [rotation, setRotation] = useState(45);  // 0-360°
  const [taillePolice, setTaillePolice] = useState(50);
  const [couleur, setCouleur] = useState('#808080');

  const handleLaunch = () => {
    if (!texte.trim()) return;

    const options = {
      texte: texte.trim(),
      position,
      opacite: opacite / 100,
      rotation,
      taillePolice,
      couleur,
    };

    // Si des pages sont sélectionnées, les envoyer
    if (selection.length > 0 && selection.length < totalPages) {
      options.pages = traduireSelection(selection);
    }

    onStart(options);
  };

  // Styles CSS de prévisualisation du filigrane
  const previewPositionStyle = () => {
    switch (position) {
      case 'haut-gauche':  return { top: '10%', left: '10%', transform: `rotate(-${rotation}deg)` };
      case 'haut-centre':  return { top: '10%', left: '50%', transform: `translateX(-50%) rotate(-${rotation}deg)` };
      case 'haut-droite':  return { top: '10%', right: '10%', transform: `rotate(-${rotation}deg)` };
      case 'centre':       return { top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(-${rotation}deg)` };
      case 'bas-gauche':   return { bottom: '10%', left: '10%', transform: `rotate(-${rotation}deg)` };
      case 'bas-centre':   return { bottom: '10%', left: '50%', transform: `translateX(-50%) rotate(-${rotation}deg)` };
      case 'bas-droite':   return { bottom: '10%', right: '10%', transform: `rotate(-${rotation}deg)` };
      default:             return { top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(-${rotation}deg)` };
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Options du filigrane</h3>
          <p className="text-body-sm text-on-surface-variant">
            {selection.length > 0
              ? `Appliqué sur ${selection.length} page${selection.length > 1 ? 's' : ''} sélectionnée${selection.length > 1 ? 's' : ''}.`
              : 'Sélectionnez des pages ou appliquez sur tout le document.'}
          </p>
        </div>

        {/* Prévisualisation miniature */}
        <div className="relative bg-white border border-outline-variant rounded-xl aspect-[3/4] overflow-hidden shadow-inner">
          {/* Lignes fictives de texte */}
          <div className="absolute inset-0 p-6 space-y-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-2 bg-gray-200 rounded" style={{ width: `${60 + (i * 7) % 35}%` }} />
            ))}
          </div>
          {/* Filigrane overlay */}
          {texte.trim() && (
            <div
              className="absolute whitespace-nowrap pointer-events-none select-none font-bold"
              style={{
                ...previewPositionStyle(),
                fontSize: `${Math.max(8, taillePolice / 4)}px`,
                color: couleur,
                opacity: opacite / 100,
              }}
            >
              {texte}
            </div>
          )}
        </div>

        {/* Texte du filigrane */}
        <div className="space-y-2">
          <label className="text-label-md font-label-bold text-on-surface">Texte du filigrane</label>
          <input
            type="text"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Ex: CONFIDENTIEL"
            maxLength={50}
            className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Grille 3x3 de positionnement */}
        <div className="space-y-2">
          <label className="text-label-md font-label-bold text-on-surface">Position</label>
          <div className="grid grid-cols-3 gap-1.5 p-3 bg-surface-container rounded-xl">
            {[0, 1, 2].map(row =>
              [0, 1, 2].map(col => {
                const pos = POSITIONS.find(p => p.row === row && p.col === col);
                if (!pos) {
                  return <div key={`${row}-${col}`} className="w-full aspect-square" />;
                }
                const isSelected = position === pos.id;
                return (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id)}
                    className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant bg-surface hover:border-primary/50 text-on-surface-variant'
                    }`}
                    title={pos.id.replace('-', ' ')}
                  >
                    {pos.label}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Opacité */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-label-md font-label-bold text-on-surface">Opacité</label>
            <span className="text-label-sm text-on-surface-variant">{opacite}%</span>
          </div>
          <input type="range" min="5" max="100" value={opacite} onChange={(e) => setOpacite(Number(e.target.value))} className="w-full accent-primary" />
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-label-md font-label-bold text-on-surface">Rotation</label>
            <span className="text-label-sm text-on-surface-variant">{rotation}°</span>
          </div>
          <input type="range" min="0" max="360" step="5" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full accent-primary" />
        </div>

        {/* Taille de police */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-label-md font-label-bold text-on-surface">Taille de police</label>
            <span className="text-label-sm text-on-surface-variant">{taillePolice}pt</span>
          </div>
          <input type="range" min="10" max="120" value={taillePolice} onChange={(e) => setTaillePolice(Number(e.target.value))} className="w-full accent-primary" />
        </div>

        {/* Couleur */}
        <div className="space-y-2">
          <label className="text-label-md font-label-bold text-on-surface">Couleur</label>
          <div className="flex items-center gap-3">
            <input type="color" value={couleur} onChange={(e) => setCouleur(e.target.value)} className="w-10 h-10 rounded-lg border border-outline-variant cursor-pointer" />
            <span className="text-body-sm text-on-surface-variant">{couleur.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-outline-variant">
        <button
          onClick={handleLaunch}
          disabled={isProcessing || !texte.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-on-primary rounded-xl font-label-bold text-label-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Traitement…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">branding_watermark</span>
              Appliquer le filigrane
            </>
          )}
        </button>
      </div>
    </div>
  );
};
