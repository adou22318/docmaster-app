import React from 'react';

export const TopBar = ({ tool, onBack, onReset, isProcessing }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-outline/20 bg-surface">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
          title="Retour au Dashboard"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-outline/20 pl-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${tool.couleur || 'primary'}/10 text-${tool.couleur || 'primary'}`}>
            <span className="material-symbols-outlined text-[20px]">{tool.icone}</span>
          </div>
          <div>
            <h1 className="font-display-md text-title-md text-on-surface">{tool.nom}</h1>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        disabled={isProcessing}
        className="px-4 py-2 text-label-md font-label-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        title="Recommencer"
      >
        <span className="material-symbols-outlined text-[18px]">refresh</span>
        <span className="hidden sm:inline">Réinitialiser</span>
      </button>
    </div>
  );
};
