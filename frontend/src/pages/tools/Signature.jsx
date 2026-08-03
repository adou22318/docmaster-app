import React, { useState, useRef, useEffect } from 'react';

export const Signature = () => {
  const [appState, setAppState] = useState('upload'); // 'upload', 'edit', 'processing', 'download'
  const [activeTab, setActiveTab] = useState('dessiner'); // 'dessiner', 'importer', 'texte'
  const [signatureData, setSignatureData] = useState(null); // The dataURL of the generated signature
  const [placedSignature, setPlacedSignature] = useState(null); // { x, y, src }
  const [progress, setProgress] = useState(0);
  const [signatureText, setSignatureText] = useState('Votre Nom');
  
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);

  // Canvas drawing logic
  useEffect(() => {
    if (activeTab === 'dessiner' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
    }
  }, [activeTab]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    hasDrawn.current = true;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
  };

  const captureCanvas = () => {
    if (!hasDrawn.current) return;
    setSignatureData(canvasRef.current.toDataURL());
  };

  // Text Signature Logic
  const handleTextChange = (e) => {
    setSignatureText(e.target.value || 'Votre Nom');
  };

  const selectTextSignature = (fontFamily) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: '${fontFamily}'; font-size: 32px; color: black; display: flex; align-items: center; justify-content: center; height: 100%;">
            ${signatureText}
          </div>
        </foreignObject>
      </svg>
    `;
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    setSignatureData(dataUrl);
  };

  // File Upload Logic
  const simulateFileUpload = () => {
    setAppState('edit');
  };

  const startProcessing = () => {
    setAppState('processing');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setAppState('download'), 500);
      }
      setProgress(currentProgress);
    }, 150);
  };

  const resetWorkflow = () => {
    setAppState('upload');
    setPlacedSignature(null);
    setSignatureData(null);
    setProgress(0);
  };

  // Drag and Drop Signature
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', signatureData);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const src = e.dataTransfer.getData('text/plain');
    if (!src) return;

    // A real implementation would calculate bounds relative to the document
    setPlacedSignature({
      src,
      x: 100, // mock coordinates
      y: 100
    });
  };

  return (
    <div className="p-12 max-w-[1600px] mx-auto w-full">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="font-display-xl text-headline-lg text-primary mb-2">Signature de Contrat</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl">Finalisez vos documents techniques avec une signature manuscrite ou typographique. Téléchargez votre document pour commencer.</p>
        </div>
        <div className="flex gap-4">
          <button 
            className="px-8 py-3 bg-surface border-2 border-primary text-primary font-label-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-300"
            onClick={resetWorkflow}
          >
            Réinitialiser
          </button>
          <button 
            className={`px-8 py-3 font-label-bold rounded-lg transition-all duration-300 ${placedSignature ? 'bg-primary text-on-primary hover:bg-secondary-container hover:text-primary shadow-md' : 'bg-primary/20 text-on-primary/50 cursor-not-allowed hidden'}`}
            disabled={!placedSignature}
            onClick={startProcessing}
          >
            Traitement du Document
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Left Sidebar - Options */}
        {appState === 'edit' && (
          <aside className="w-full xl:w-[360px] space-y-6 flex-shrink-0 animate-fade-in-right">
            <div className="bg-surface-container p-6 rounded-xl shadow-sm border border-outline-variant/30">
              <h3 className="font-label-bold text-primary mb-6 uppercase tracking-widest text-xs">Modes de Signature</h3>
              
              <div className="flex flex-col gap-2 mb-6">
                <button className={`w-full flex items-center justify-between p-4 border rounded-lg transition-all ${activeTab === 'dessiner' ? 'bg-secondary-container text-primary border-secondary-container' : 'bg-background border-outline-variant'}`} onClick={() => setActiveTab('dessiner')}>
                  <div className="flex items-center gap-3"><span className="material-symbols-outlined">gesture</span><span className="font-body-md font-bold">Dessiner</span></div>
                </button>
                <button className={`w-full flex items-center justify-between p-4 border rounded-lg transition-all ${activeTab === 'importer' ? 'bg-secondary-container text-primary border-secondary-container' : 'bg-background border-outline-variant'}`} onClick={() => setActiveTab('importer')}>
                  <div className="flex items-center gap-3"><span className="material-symbols-outlined">upload_file</span><span className="font-body-md font-bold">Importer</span></div>
                </button>
                <button className={`w-full flex items-center justify-between p-4 border rounded-lg transition-all ${activeTab === 'texte' ? 'bg-secondary-container text-primary border-secondary-container' : 'bg-background border-outline-variant'}`} onClick={() => setActiveTab('texte')}>
                  <div className="flex items-center gap-3"><span className="material-symbols-outlined">format_italic</span><span className="font-body-md font-bold">Typographique</span></div>
                </button>
              </div>

              {activeTab === 'dessiner' && (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-outline-variant rounded-lg overflow-hidden relative">
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-40 cursor-crosshair touch-none" 
                      width="300" height="150"
                      onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-xs font-label-bold border border-outline text-outline rounded hover:bg-surface-variant transition-colors" onClick={clearCanvas}>Effacer</button>
                    <button className="flex-1 py-2 text-xs font-label-bold bg-primary text-white rounded hover:bg-secondary-container hover:text-primary transition-colors" onClick={captureCanvas}>Générer</button>
                  </div>
                </div>
              )}

              {activeTab === 'importer' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-outline-variant rounded-lg p-8 text-center cursor-pointer hover:border-secondary-container hover:bg-secondary-container/5 transition-all">
                    <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">add_photo_alternate</span>
                    <p className="text-xs font-label-bold text-on-surface-variant">Importer un tracé</p>
                  </div>
                </div>
              )}

              {activeTab === 'texte' && (
                <div className="space-y-4">
                  <input 
                    className="w-full p-3 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary-container outline-none font-body-md" 
                    value={signatureText} 
                    onChange={handleTextChange} 
                    placeholder="Tapez votre nom..." 
                    type="text"
                  />
                  <div className="grid grid-cols-1 gap-3">
                    {/* requires Google Fonts: Dancing Script, Great Vibes, Pacifico */}
                    <div className="p-4 bg-white border border-outline-variant rounded-lg cursor-pointer hover:border-secondary-container transition-all" onClick={() => selectTextSignature('Dancing Script')}>
                      <p className="text-2xl text-center" style={{ fontFamily: "'Dancing Script', cursive" }}>{signatureText}</p>
                    </div>
                    <div className="p-4 bg-white border border-outline-variant rounded-lg cursor-pointer hover:border-secondary-container transition-all" onClick={() => selectTextSignature('Great Vibes')}>
                      <p className="text-2xl text-center" style={{ fontFamily: "'Great Vibes', cursive" }}>{signatureText}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-10 border-t border-outline-variant/30 pt-6">
                <h4 className="font-label-bold text-on-surface-variant mb-4 text-xs uppercase">Aperçu Signature</h4>
                <div className="relative bg-white border-2 border-dashed border-outline-variant p-4 rounded h-28 flex items-center justify-center group overflow-hidden">
                  {signatureData ? (
                    <div className="h-full flex items-center justify-center cursor-grab active:cursor-grabbing" draggable onDragStart={handleDragStart}>
                      <img className="max-h-full pointer-events-none" src={signatureData} alt="Aperçu signature" />
                    </div>
                  ) : (
                    <p className="text-[10px] text-outline-variant italic text-center px-4">Créez ou importez une signature</p>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant italic mt-3 text-center">Glissez l'image sur le document</p>
              </div>
            </div>
          </aside>
        )}

        {/* Central Area */}
        <div className="bg-surface-dim p-12 rounded-2xl flex-1 flex justify-center items-center overflow-hidden min-h-[800px] shadow-inner relative w-full">
          
          {appState === 'upload' && (
            <div className="w-full max-w-[700px] flex flex-col items-center justify-center">
              <div 
                className="w-full aspect-[3/4] bg-white border-4 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:border-secondary-container hover:bg-secondary-container/5 transition-all group" 
                onClick={simulateFileUpload}
              >
                <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-5xl text-primary">cloud_upload</span>
                </div>
                <h3 className="font-display-xl text-headline-md mb-4 text-primary">Déposez votre document</h3>
                <p className="text-body-lg text-on-surface-variant mb-8">Glissez-déposez le PDF à signer ici ou cliquez pour parcourir vos fichiers.</p>
                <div className="px-8 py-4 bg-primary text-on-primary rounded-xl font-label-bold group-hover:bg-secondary transition-colors">
                  Sélectionner un fichier
                </div>
              </div>
            </div>
          )}

          {appState === 'edit' && (
            <div 
              className="w-full max-w-[700px] bg-white shadow-2xl relative p-16 transition-transform duration-500 hover:scale-[1.01] aspect-[1/1.4]" 
              onDragOver={handleDragOver} 
              onDrop={handleDrop}
            >
              <div className="space-y-8 pointer-events-none select-none opacity-80">
                <div className="flex justify-between items-start mb-16">
                  <div className="w-24 h-8 bg-surface-container-high rounded"></div>
                  <div className="text-right space-y-1">
                    <div className="w-32 h-3 bg-surface-container-high ml-auto rounded"></div>
                    <div className="w-48 h-3 bg-surface-container-high ml-auto rounded"></div>
                  </div>
                </div>
                <div className="w-1/2 h-6 bg-primary rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="w-full h-3 bg-surface-container-high rounded"></div>
                  <div className="w-full h-3 bg-surface-container-high rounded"></div>
                </div>
                
                <div className="mt-32 pt-12 border-t border-outline-variant flex justify-between items-end">
                  <div className="space-y-2">
                    <p className="font-label-bold text-xs uppercase text-outline">Lu et approuvé</p>
                    <div className="w-48 h-12 bg-surface-container-lowest border border-dashed border-outline-variant flex items-center justify-center text-[10px] text-outline-variant italic">
                      Zone de signature
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-label-bold text-xs uppercase text-outline">Le Prestataire</p>
                    <p className="font-body-md text-primary mt-2">DocMaster Services</p>
                  </div>
                </div>
              </div>

              {placedSignature && (
                <div 
                  className="absolute w-48 h-24 bg-transparent cursor-move group" 
                  style={{ left: placedSignature.x, top: placedSignature.y }}
                >
                  <img className="w-full h-full object-contain" src={placedSignature.src} alt="Signature placée" />
                  <div 
                    className="absolute -top-3 -right-3 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity" 
                    onClick={() => setPlacedSignature(null)}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {appState === 'processing' && (
            <div className="w-full max-w-[700px] flex flex-col items-center justify-center">
              <div className="w-20 h-20 border-4 border-surface-container border-t-secondary-container rounded-full animate-spin mb-8"></div>
              <h3 className="font-display-xl text-headline-md mb-4 text-primary">Inclusion de la signature...</h3>
              <div className="w-full max-w-sm h-3 bg-surface-container rounded-full overflow-hidden mb-4">
                <div className="h-full bg-secondary-container transition-all duration-150" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-on-surface-variant font-body-md">Sécurisation du certificat eIDAS en cours ({Math.floor(progress)}%)</p>
            </div>
          )}

          {appState === 'download' && (
            <div className="w-full max-w-[700px] flex flex-col items-center justify-center">
              <div className="w-full bg-white rounded-3xl p-12 shadow-xl border border-outline-variant flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h3 className="font-display-xl text-headline-md mb-2 text-primary">Signature Apposée !</h3>
                <p className="text-body-lg text-on-surface-variant text-center mb-12">Le document "contrat_maintenance_signe.pdf" est prêt à être téléchargé.</p>
                <div className="w-full grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 py-4 bg-primary text-on-primary rounded-xl font-label-bold hover:bg-primary/90 transition-all shadow-lg" onClick={resetWorkflow}>
                    <span className="material-symbols-outlined">download</span> Télécharger PDF
                  </button>
                  <button className="flex items-center justify-center gap-3 py-4 border-2 border-outline-variant text-primary rounded-xl font-label-bold hover:bg-surface transition-all" onClick={resetWorkflow}>
                    <span className="material-symbols-outlined">restart_alt</span> Recommencer
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar - Document Info */}
        {appState === 'edit' && (
          <aside className="w-full xl:w-[300px] space-y-8 flex-shrink-0 animate-fade-in-left">
            <div className="bg-surface p-6 rounded-xl border border-outline-variant/30">
              <h3 className="font-label-bold text-primary mb-4 text-xs uppercase">Détails du document</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-on-surface-variant font-label-bold block mb-1">Nom du fichier</label>
                  <p className="font-body-md font-bold truncate">contrat_maintenance_v2.pdf</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-on-surface-variant font-label-bold block mb-1">Taille</label>
                    <p className="font-body-md">2.4 MB</p>
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant font-label-bold block mb-1">Pages</label>
                    <p className="font-body-md">1 / 1</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant/30">
              <h3 className="font-label-bold text-primary mb-4 text-xs uppercase">Aperçu Pages</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-[3/4] bg-white border-2 border-secondary-container rounded p-2 flex flex-col justify-between">
                  <div className="w-full h-1 bg-surface-variant rounded"></div>
                  <div className="w-2/3 h-1 bg-surface-variant rounded"></div>
                  <span className="text-[10px] text-center font-bold">Page 1</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
