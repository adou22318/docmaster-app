import React, { useState, useRef } from 'react';

export const Conversion = () => {
  const [appState, setAppState] = useState('upload'); // 'upload', 'processing', 'result'
  const [currentFile, setCurrentFile] = useState(null);
  const [conversionType, setConversionType] = useState('img_to_pdf'); // 'img_to_pdf', 'pdf_to_img', 'office_to_pdf', 'pdf_to_txt'
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
    setAppState('upload');
  };

  const startConversion = () => {
    if (!currentFile) return;
    setAppState('processing');
    
    setTimeout(() => {
      setAppState('result');
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row p-gutter gap-gutter">
      <div className="flex-1 flex flex-col gap-unit">
        <nav className="flex items-center bg-surface-container-low p-2 rounded-xl mb-4 self-start">
          <button className="px-6 py-2 rounded-lg bg-surface flex items-center gap-3 text-primary font-label-bold text-label-bold shadow-sm transition-all">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>sync_alt</span>
            Conversion
          </button>
        </nav>

        <div className="flex-1 relative group">
          <div 
            className={`w-full h-full border-4 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${!currentFile ? 'cursor-pointer hover:border-secondary hover:bg-surface-container-low border-outline-variant bg-surface' : 'border-outline-variant bg-surface'}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            {!currentFile && (
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="w-24 h-24 mb-8 bg-on-tertiary-fixed-variant/5 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-tertiary-container text-[48px] animate-pulse">cloud_upload</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-primary mb-2">Déposez vos fichiers ici</h2>
                <p className="font-body-md text-on-surface-variant mb-12">PDF, Word, Excel, JPG, PNG pris en charge.</p>
                <div className="flex gap-4 pointer-events-auto">
                  <button className="px-8 py-3 bg-primary text-on-primary font-label-bold text-label-bold hover:bg-secondary-container hover:text-primary transition-all" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
                    Sélectionner des fichiers
                  </button>
                </div>
              </div>
            )}

            {currentFile && appState === 'upload' && (
              <div className="flex flex-col items-center justify-center w-full max-w-md">
                <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant w-full flex items-center gap-4 mb-8 cursor-default" onClick={(e) => e.stopPropagation()}>
                  <span className="material-symbols-outlined text-secondary text-4xl">description</span>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-label-bold text-primary truncate">{currentFile.name}</p>
                    <p className="text-label-sm text-on-surface-variant">Taille inconnue</p>
                  </div>
                  <button className="p-2 hover:bg-error/10 text-error rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); resetUI(); }}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
            )}

            {appState === 'processing' && (
              <div className="w-full space-y-4 text-center px-12 cursor-default" onClick={(e) => e.stopPropagation()}>
                <p className="font-label-bold text-secondary animate-pulse">Conversion en cours...</p>
                <div className="w-full max-w-md mx-auto bg-surface-container-high rounded-full overflow-hidden h-4">
                  <div className="h-full bg-secondary-container transition-all duration-[2000ms] ease-in-out" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}

            {appState === 'result' && (
              <div className="w-full text-center space-y-8 cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 rounded-full border border-green-200">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span className="font-label-bold">Conversion terminée !</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button className="w-full max-w-md py-4 bg-secondary-container text-primary font-label-bold text-body-lg rounded-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-lg active:scale-95" onClick={resetUI}>
                    <span className="material-symbols-outlined">download</span> Télécharger le fichier converti
                  </button>
                  <button className="text-label-sm font-label-bold text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4" onClick={resetUI}>
                    Convertir un autre fichier
                  </button>
                </div>
              </div>
            )}

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: SETTINGS PANEL */}
      <aside className="w-full lg:w-[400px] bg-surface-container shadow-[0_4px_40px_rgba(26,28,30,0.06)] flex flex-col p-8 rounded-xl border border-outline-variant/10">
        <div className="mb-12">
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Paramètres de conversion</h3>
          <p className="font-body-md text-on-surface-variant">Choisissez le type de conversion souhaité.</p>
        </div>

        <div className="space-y-6 flex-1">
          <label className="block">
            <span className="font-label-bold text-label-bold text-primary block mb-4">FORMAT DE SORTIE</span>
            <div className="space-y-4">
              
              <div className="relative cursor-pointer group" onClick={() => setConversionType('img_to_pdf')}>
                <input checked={conversionType === 'img_to_pdf'} readOnly className="peer hidden" type="radio" />
                <div className="block p-5 border-2 rounded-lg transition-all peer-checked:border-secondary-container peer-checked:bg-secondary-container/5 border-outline-variant">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-label-bold text-label-bold text-primary">Images vers PDF</span>
                  </div>
                  <p className="text-on-surface-variant font-body-md text-[14px]">Fusionnez vos JPG/PNG en un seul document PDF.</p>
                </div>
              </div>

              <div className="relative cursor-pointer group" onClick={() => setConversionType('pdf_to_img')}>
                <input checked={conversionType === 'pdf_to_img'} readOnly className="peer hidden" type="radio" />
                <div className="block p-5 border-2 rounded-lg transition-all peer-checked:border-secondary-container peer-checked:bg-secondary-container/5 border-outline-variant">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-label-bold text-label-bold text-primary">PDF vers Images</span>
                  </div>
                  <p className="text-on-surface-variant font-body-md text-[14px]">Extrayez chaque page en image JPG haute qualité.</p>
                </div>
              </div>

              <div className="relative cursor-pointer group" onClick={() => setConversionType('office_to_pdf')}>
                <input checked={conversionType === 'office_to_pdf'} readOnly className="peer hidden" type="radio" />
                <div className="block p-5 border-2 rounded-lg transition-all peer-checked:border-secondary-container peer-checked:bg-secondary-container/5 border-outline-variant">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-label-bold text-label-bold text-primary">Office vers PDF</span>
                  </div>
                  <p className="text-on-surface-variant font-body-md text-[14px]">Convertissez Word, Excel ou PowerPoint en PDF.</p>
                </div>
              </div>

              <div className="relative cursor-pointer group" onClick={() => setConversionType('pdf_to_txt')}>
                <input checked={conversionType === 'pdf_to_txt'} readOnly className="peer hidden" type="radio" />
                <div className="block p-5 border-2 rounded-lg transition-all peer-checked:border-secondary-container peer-checked:bg-secondary-container/5 border-outline-variant">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-label-bold text-label-bold text-primary">PDF vers Texte (TXT)</span>
                  </div>
                  <p className="text-on-surface-variant font-body-md text-[14px]">Extrayez le texte brut de votre document PDF.</p>
                </div>
              </div>

            </div>
          </label>
        </div>

        <div className="mt-8 space-y-4">
          {appState !== 'result' && (
            <button 
              className="w-full py-5 bg-primary text-on-primary font-headline-md text-headline-md flex items-center justify-center gap-4 hover:bg-secondary-container hover:text-primary transition-all group active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={!currentFile || appState === 'processing'}
              onClick={startConversion}
            >
              Convertir
              <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">bolt</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
