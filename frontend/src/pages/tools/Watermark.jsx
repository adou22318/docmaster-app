import React, { useState } from 'react';

export const Watermark = () => {
  const [appState, setAppState] = useState('upload'); // 'upload', 'processing', 'result'
  const [watermarkText, setWatermarkText] = useState('DOCMASTER CONFIDENTIEL');
  const [opacity, setOpacity] = useState(25);
  const [rotation, setRotation] = useState(-45);
  const [activePos, setActivePos] = useState(4); // 0-8 for 3x3 grid
  const [color, setColor] = useState('#7a5900');

  const simulateUpload = () => {
    setAppState('processing');
    setTimeout(() => {
      setAppState('result');
    }, 2000);
  };

  const applyWatermark = () => {
    setAppState('processing');
    setTimeout(() => {
      setAppState('result');
    }, 1800);
  };

  const resetWorkflow = () => {
    setAppState('upload');
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Workspace / Dropzone (Asymmetric Offset) */}
      <div className="flex-1 p-margin-desktop relative overflow-y-auto">
        <div className="max-w-[800px] mx-auto mt-8">
          <div className="mb-12">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Filigrane PDF</h2>
            <p className="text-on-surface-variant font-body-lg max-w-lg">Ajoutez une marque de propriété ou un statut "Confidentiel" à vos documents techniques en quelques clics.</p>
          </div>

          {/* Steps Container */}
          <div className="relative group" id="workflow-container">
            {/* STEP 1: Upload */}
            {appState === 'upload' && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-secondary-fixed to-tertiary-fixed-dim rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-[2rem] p-16 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-secondary hover:shadow-xl">
                  <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-secondary text-5xl">cloud_upload</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Glissez votre PDF ici</h3>
                  <p className="text-on-surface-variant mb-8">ou cliquez pour parcourir vos fichiers techniques</p>
                  <button className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-bold hover:bg-secondary hover:text-on-secondary transition-all active:scale-95" onClick={simulateUpload}>
                    Sélectionner un fichier
                  </button>
                  <div className="mt-12 flex items-center gap-2 text-on-surface-variant/60 font-label-sm">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Sécurité : Tous les fichiers sont traités localement sur votre navigateur.
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Processing Animation */}
            {appState === 'processing' && (
              <div className="relative">
                <div className="relative bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[2rem] p-24 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 border-4 border-secondary-container/10 border-l-secondary-container rounded-full animate-spin mb-8"></div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Application du filigrane...</h3>
                  <p className="text-on-surface-variant">Analyse vectorielle et incrustation en cours</p>
                  <div className="w-64 h-2 bg-surface-container-high rounded-full mt-8 overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 bg-secondary-fixed-dim w-1/3 animate-[progress_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Download Result */}
            {appState === 'result' && (
              <div className="relative">
                <div className="relative bg-surface-container-lowest border-2 border-secondary-fixed-dim rounded-[2rem] p-16 flex flex-col items-center justify-center text-center shadow-xl">
                  <div className="w-24 h-24 bg-secondary-fixed-dim/20 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-secondary text-5xl">check_circle</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Document prêt !</h3>
                  <p className="text-on-surface-variant mb-8">Le filigrane a été appliqué avec succès sur 12 pages.</p>
                  <div className="flex gap-4">
                    <button className="border-2 border-outline-variant text-on-surface px-8 py-3 rounded-xl font-label-bold hover:bg-surface-container-high transition-all" onClick={resetWorkflow}>
                      Recommencer
                    </button>
                    <button className="bg-primary text-on-primary px-10 py-3 rounded-xl font-label-bold hover:bg-secondary hover:text-on-secondary transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined">download</span>
                      Télécharger le PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visual Context / Recent Docs (Editorial Rhythm) */}
          <div className="mt-16 grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-7 bg-surface-container-low p-8 rounded-2xl">
              <h4 className="font-label-bold text-primary mb-4 uppercase tracking-widest">Conseil Technique</h4>
              <p className="text-body-md text-on-surface-variant">L'opacité recommandée pour un filigrane de fond est de 15%. Cela garantit la lisibilité du texte technique tout en maintenant la protection visuelle.</p>
            </div>
            <div className="col-span-12 md:col-span-5 relative overflow-hidden rounded-2xl h-48">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA9i6WZu8EBUmwEF5EKpZOfITemf_khK0kq7kduB3oHSQoyejF9tXiIhk0Oinuea-hyjtMhETTqUqnMYIR1-aSpS-IEMPewAbb_FMd9WZhSk-ZcNK6vhAjE7c7J2e9_HvjTXSyjs9_WlFEW09Q7f21c2Oy1cFYV7xzl0YQi0BmWSMJe8bruUmcVcyfiVbwE4Xy3g1Gx0y3xbkeu55-e6H1_lrkfHx3FJsELc1at7M3k5R9rxKdrGERrYQ')" }}></div>
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-on-primary font-label-bold bg-primary/60 px-4 py-2 rounded-full">Exemple de rendu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Parameters Panel */}
      <aside className={`w-[380px] bg-surface-container-lowest shadow-[-10px_0_40px_rgba(26,28,30,0.04)] overflow-y-auto p-8 border-l border-outline-variant/30 transition-opacity duration-300 ${appState === 'processing' ? 'opacity-50 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
        <div className="flex items-center gap-2 mb-8 border-b border-outline-variant/20 pb-4">
          <span className="material-symbols-outlined text-secondary">tune</span>
          <h3 className="font-headline-md text-headline-md text-primary uppercase tracking-tight text-lg">Configuration</h3>
        </div>

        <div className="space-y-10">
          {/* Text Input */}
          <div>
            <label className="block font-label-bold text-on-surface mb-3 uppercase tracking-tighter text-xs">Contenu du filigrane</label>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-low border-b-2 border-primary/20 focus:border-secondary-container focus:ring-0 text-body-lg p-3 transition-all outline-none font-label-bold rounded-t-lg" 
                type="text" 
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
              />
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="font-label-bold text-on-surface uppercase tracking-tighter text-xs">Opacité visuelle</label>
              <span className="font-label-bold text-primary text-sm">{opacity}%</span>
            </div>
            <input 
              className="w-full cursor-pointer accent-primary" 
              type="range" 
              min="0" max="100" 
              value={opacity} 
              onChange={(e) => setOpacity(e.target.value)} 
            />
          </div>

          {/* Rotation Slider */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="font-label-bold text-on-surface uppercase tracking-tighter text-xs">Angle de rotation</label>
              <span className="font-label-bold text-primary text-sm">{rotation}°</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                className="flex-1 cursor-pointer accent-primary" 
                type="range" 
                min="-180" max="180" 
                value={rotation} 
                onChange={(e) => setRotation(e.target.value)} 
              />
              <div className="w-16 relative">
                <input 
                  className="w-full bg-surface-container-high border-none rounded-lg text-center font-label-bold py-2 text-sm" 
                  type="number" 
                  value={rotation}
                  onChange={(e) => setRotation(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Position Grid 3x3 */}
          <div>
            <label className="block font-label-bold text-on-surface mb-4 uppercase tracking-tighter text-xs">Positionnement relatif</label>
            <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
              {[0,1,2,3,4,5,6,7,8].map(index => (
                <button 
                  key={index}
                  className={`h-8 border-2 rounded hover:border-secondary transition-all ${activePos === index ? 'border-secondary-container bg-secondary-container' : 'border-outline-variant/30'}`}
                  onClick={() => setActivePos(index)}
                ></button>
              ))}
            </div>
          </div>

          {/* Color & Style */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-bold text-on-surface mb-2 uppercase tracking-tighter text-xs">Code Couleur</label>
              <div className="flex items-center gap-2 bg-surface-container-high p-2 rounded-lg cursor-pointer hover:bg-surface-container-highest transition-colors relative">
                <input 
                  className="w-6 h-6 rounded-full border-none bg-transparent cursor-pointer" 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <span className="font-label-sm text-[10px] tracking-widest">{color.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <label className="block font-label-bold text-on-surface mb-2 uppercase tracking-tighter text-xs">Taille Typo</label>
              <select className="w-full bg-surface-container-high border-none rounded-lg font-label-bold py-2 px-3 text-xs outline-none">
                <option>48 px</option>
                <option>72 px</option>
                <option>96 px</option>
                <option>Expert</option>
              </select>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-8 border-t border-outline-variant/20">
            <button 
              className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-2xl font-display-xl text-headline-md hover:bg-secondary hover:text-on-secondary transition-all shadow-xl active:scale-95"
              onClick={applyWatermark}
            >
              Appliquer
            </button>
            <p className="text-center mt-4 text-on-surface-variant/60 font-label-sm text-[10px]">Traitement local sécurisé • Latence &lt; 2s</p>
          </div>
        </div>
      </aside>
    </div>
  );
};
