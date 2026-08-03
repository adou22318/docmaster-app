import React, { useState, useRef } from 'react';

export const SplitMerge = () => {
  const [appState, setAppState] = useState('upload'); // 'upload', 'edit', 'processing', 'result'
  const [currentFile, setCurrentFile] = useState(null);
  const [pages, setPages] = useState([]); // Array of { id, number, selected }
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    setCurrentFile(files[0]);
    // Simulate parsing pages
    setTimeout(() => {
      setPages([
        { id: 1, number: 1, selected: false },
        { id: 2, number: 2, selected: false },
        { id: 3, number: 3, selected: false },
        { id: 4, number: 4, selected: false }
      ]);
      setAppState('edit');
    }, 500);
  };

  const triggerFileInput = () => {
    if (!currentFile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const resetUI = () => {
    setCurrentFile(null);
    setPages([]);
    setAppState('upload');
  };

  const togglePageSelection = (id) => {
    setPages(pages.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const startProcessing = () => {
    if (!currentFile) return;
    setAppState('processing');
    
    setTimeout(() => {
      setAppState('result');
    }, 2000);
  };

  const addBlankPage = (position) => {
    // position: 'start', 'end'
    const newPage = { id: Date.now(), number: 'Vierge', selected: false };
    if (position === 'start') {
      setPages([newPage, ...pages]);
    } else {
      setPages([...pages, newPage]);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row p-gutter gap-gutter">
      <div className="flex-1 flex flex-col gap-unit">
        <nav className="flex items-center bg-surface-container-low p-2 rounded-xl mb-4 self-start">
          <button className="px-6 py-2 rounded-lg bg-surface flex items-center gap-3 text-primary font-label-bold text-label-bold shadow-sm transition-all">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
            Organiser / Fusionner
          </button>
        </nav>

        <div className="flex-1 relative group">
          <div 
            className={`w-full h-full border-4 ${appState === 'upload' ? 'border-dashed border-outline-variant hover:border-secondary hover:bg-surface-container-low bg-surface cursor-pointer' : 'border-transparent bg-transparent'} rounded-xl flex flex-col items-center justify-center transition-all duration-300`}
            onDragOver={appState === 'upload' ? handleDragOver : undefined}
            onDrop={appState === 'upload' ? handleDrop : undefined}
            onClick={appState === 'upload' ? triggerFileInput : undefined}
          >
            {appState === 'upload' && (
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="w-24 h-24 mb-8 bg-on-tertiary-fixed-variant/5 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-tertiary-container text-[48px] animate-pulse">cloud_upload</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-primary mb-2">Déposez votre PDF ici</h2>
                <p className="font-body-md text-on-surface-variant mb-12">Pour extraire, supprimer ou réorganiser des pages.</p>
                <div className="flex gap-4 pointer-events-auto">
                  <button className="px-8 py-3 bg-primary text-on-primary font-label-bold text-label-bold hover:bg-secondary-container hover:text-primary transition-all" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
                    Sélectionner un fichier
                  </button>
                </div>
              </div>
            )}

            {appState === 'edit' && (
              <div className="w-full h-full bg-surface-container-low p-8 rounded-xl overflow-y-auto cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-primary">Aperçu des pages</h3>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-surface text-primary border border-outline-variant rounded font-label-bold flex items-center gap-2 hover:bg-surface-container transition-all" onClick={() => addBlankPage('start')}>
                      <span className="material-symbols-outlined text-[18px]">add</span> Page au début
                    </button>
                    <button className="px-4 py-2 bg-surface text-primary border border-outline-variant rounded font-label-bold flex items-center gap-2 hover:bg-surface-container transition-all" onClick={() => addBlankPage('end')}>
                      <span className="material-symbols-outlined text-[18px]">add</span> Page à la fin
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {pages.map((page, index) => (
                    <div 
                      key={page.id} 
                      className={`relative aspect-[3/4] bg-white border-2 rounded-lg p-2 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md transition-all ${page.selected ? 'border-secondary-container' : 'border-outline-variant/30 hover:border-outline-variant'}`}
                      onClick={() => togglePageSelection(page.id)}
                    >
                      <div className="absolute top-2 right-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${page.selected ? 'bg-secondary-container border-secondary-container text-primary' : 'border-outline-variant text-transparent'}`}>
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                      </div>
                      <div className="w-full h-4 bg-surface-variant rounded opacity-50 mt-8"></div>
                      <div className="w-2/3 h-4 bg-surface-variant rounded opacity-50"></div>
                      <div className="w-3/4 h-4 bg-surface-variant rounded opacity-50"></div>
                      <div className="text-center font-label-bold text-on-surface-variant mt-auto pt-2 border-t border-outline-variant/20">
                        {page.number}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-8 text-on-surface-variant font-label-sm">Sélectionnez les pages que vous souhaitez extraire ou supprimer. Vous pouvez également ajouter des pages vierges.</p>
              </div>
            )}

            {appState === 'processing' && (
              <div className="w-full space-y-4 text-center px-12 cursor-default" onClick={(e) => e.stopPropagation()}>
                <p className="font-label-bold text-secondary animate-pulse">Traitement du document en cours...</p>
                <div className="w-full max-w-md mx-auto bg-surface-container-high rounded-full overflow-hidden h-4">
                  <div className="h-full bg-secondary-container transition-all duration-[2000ms] ease-in-out" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}

            {appState === 'result' && (
              <div className="w-full text-center space-y-8 cursor-default bg-surface-container-low p-12 rounded-xl border border-outline-variant/30" onClick={(e) => e.stopPropagation()}>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 rounded-full border border-green-200">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span className="font-label-bold">Traitement terminé !</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button className="w-full max-w-md py-4 bg-secondary-container text-primary font-label-bold text-body-lg rounded-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-lg active:scale-95" onClick={resetUI}>
                    <span className="material-symbols-outlined">download</span> Télécharger le PDF
                  </button>
                  <button className="text-label-sm font-label-bold text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4" onClick={resetUI}>
                    Traiter un autre fichier
                  </button>
                </div>
              </div>
            )}

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: SETTINGS PANEL */}
      <aside className="w-full lg:w-[400px] bg-surface-container shadow-[0_4px_40px_rgba(26,28,30,0.06)] flex flex-col p-8 rounded-xl border border-outline-variant/10">
        <div className="mb-12">
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Actions</h3>
          <p className="font-body-md text-on-surface-variant">Choisissez quoi faire avec la sélection.</p>
        </div>

        <div className="space-y-6 flex-1">
          <div className="bg-surface p-4 rounded-lg border border-outline-variant/30">
            <h4 className="font-label-bold text-primary mb-2">Sélection</h4>
            <p className="text-display-xl text-secondary-container">{pages.filter(p => p.selected).length}</p>
            <p className="text-label-sm text-on-surface-variant">Pages sélectionnées sur {pages.length}</p>
          </div>

          <div className="space-y-3">
            <button 
              className="w-full py-4 px-4 bg-surface text-primary border-2 border-outline-variant rounded-lg font-label-bold hover:border-secondary-container hover:bg-secondary-container/5 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={appState !== 'edit' || pages.filter(p => p.selected).length === 0}
            >
              <span className="material-symbols-outlined text-[20px]">content_cut</span>
              Extraire la sélection
            </button>
            <button 
              className="w-full py-4 px-4 bg-error/10 text-error border-2 border-error/20 rounded-lg font-label-bold hover:bg-error hover:text-white hover:border-error transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={appState !== 'edit' || pages.filter(p => p.selected).length === 0}
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
              Supprimer la sélection
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {appState !== 'result' && (
            <button 
              className="w-full py-5 bg-primary text-on-primary font-headline-md text-headline-md flex items-center justify-center gap-4 hover:bg-secondary-container hover:text-primary transition-all group active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={!currentFile || appState === 'processing'}
              onClick={startProcessing}
            >
              Appliquer & Générer
              <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">bolt</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
