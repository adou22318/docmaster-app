import React, { useState } from 'react';

export const Security = () => {
  const [appState, setAppState] = useState('upload'); // 'upload', 'processing', 'result'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    print: false,
    copy: true,
    modify: false
  });
  const [progress, setProgress] = useState(0);

  const togglePwd = () => setShowPassword(!showPassword);

  const startProcessing = () => {
    setAppState('processing');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setAppState('result');
        }, 500);
      }
      setProgress(currentProgress);
    }, 200);
  };

  const resetUI = () => {
    setAppState('upload');
    setProgress(0);
    setPassword('');
  };

  return (
    <div className="flex-grow p-gutter overflow-hidden flex flex-col">
      {/* Tool Tabs (Top) */}
      <div className="mb-gutter flex items-center justify-between">
        <div className="flex border-b-2 border-outline-variant w-full max-w-4xl">
          <button className="px-8 py-4 font-label-bold text-label-bold border-b-2 border-secondary-container text-secondary-container transition-all flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            Protéger
          </button>
          {/* <button className="px-8 py-4 font-label-bold text-label-bold text-on-surface-variant hover:text-primary transition-all flex items-center gap-2 group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">lock_open</span>
            Déverrouiller
          </button> */}
        </div>
        <div className="text-right flex items-center gap-2 px-gutter">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Statut :</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full font-label-bold text-[10px] uppercase tracking-widest ${appState === 'upload' ? 'bg-on-tertiary-fixed-variant/10 text-on-tertiary-container' : appState === 'processing' ? 'bg-secondary-container/20 text-secondary-container' : 'text-green-600 bg-green-100'}`}>
            {appState === 'upload' ? 'Prêt' : appState === 'processing' ? 'Traitement...' : 'Terminé'}
          </span>
        </div>
      </div>

      {/* Unified Content */}
      <div className="flex-grow grid grid-cols-12 gap-gutter overflow-hidden">
        {/* Center: Drag and Drop & Result Zone */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-full space-y-4">
          {/* Dropzone */}
          <div className="flex-grow relative border-4 border-dashed border-outline-variant hover:border-secondary-container transition-all group cursor-pointer flex flex-col items-center justify-center p-gutter bg-surface-container-lowest/50 rounded-xl overflow-hidden" id="drop-zone">
            
            {appState === 'upload' && (
              <div className="relative z-10 flex flex-col items-center text-center max-w-md">
                <div className="w-24 h-24 mb-6 bg-surface-container rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[48px] text-on-tertiary-container">upload_file</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-primary mb-2">Importer votre document</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">PDF jusqu'à 250MB. Vos données sont sécurisées.</p>
                <button className="px-8 py-4 bg-primary text-on-primary font-label-bold rounded-none hover:bg-secondary-container hover:text-primary transition-all flex items-center gap-3">
                  Parcourir les fichiers
                  <span className="material-symbols-outlined">folder</span>
                </button>
              </div>
            )}

            {appState === 'result' && (
              <div className="relative z-10 flex flex-col items-center text-center max-w-md">
                <div className="w-24 h-24 mb-6 bg-green-100 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="material-symbols-outlined text-[48px] text-green-600">check_circle</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-primary mb-2">Document Protégé !</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8">Votre document est maintenant chiffré et prêt à être partagé en toute sécurité.</p>
                <div className="flex gap-4">
                  <button className="px-10 py-5 bg-secondary-container text-primary font-headline-md uppercase tracking-tight hover:bg-secondary transition-all flex items-center gap-4 shadow-xl">
                    Télécharger le PDF
                    <span className="material-symbols-outlined">download</span>
                  </button>
                  <button className="px-6 py-5 border-2 border-outline-variant font-label-bold hover:bg-surface-container transition-all" onClick={resetUI}>Nouveau</button>
                </div>
              </div>
            )}

            {appState === 'processing' && (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <div className="w-64 h-2 bg-outline-variant rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="mt-4 font-label-bold text-primary">Chiffrement en cours...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Security Settings Panel */}
        <aside className="col-span-12 lg:col-span-4 h-full bg-surface-container-low p-8 flex flex-col shadow-[0_4px_40px_rgba(26,28,30,0.08)] rounded-xl border border-outline-variant/30">
          <div className="mb-8">
            <h3 className="font-headline-md text-headline-md text-primary mb-2">Paramètres de Sécurité</h3>
            <div className="w-12 h-1 bg-secondary-container"></div>
          </div>

          <div className="flex-grow space-y-10 overflow-y-auto pr-4">
            {/* Password Input */}
            <div className="space-y-4">
              <label className="font-label-bold text-label-bold block uppercase tracking-tighter text-on-surface-variant">Mot de passe AES-256</label>
              <div className="relative group">
                <input 
                  className="w-full bg-transparent border-b-2 border-outline focus:border-secondary-container border-t-0 border-x-0 px-0 py-3 ring-0 focus:ring-0 transition-all font-body-md" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Saisir la clé de chiffrement" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span 
                  className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-outline-variant cursor-pointer hover:text-primary transition-colors" 
                  onClick={togglePwd}
                >
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </div>
            </div>

            {/* Permissions Checkboxes */}
            <div className="space-y-4">
              <label className="font-label-bold text-label-bold block uppercase tracking-tighter text-on-surface-variant">Permissions</label>
              <div className="space-y-3">
                
                <label className="flex items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-outline-variant checked:bg-secondary-container checked:border-secondary-container transition-all" 
                      checked={permissions.print}
                      onChange={() => setPermissions({...permissions, print: !permissions.print})}
                    />
                    <span className="material-symbols-outlined absolute text-[14px] text-primary hidden peer-checked:block">check</span>
                  </div>
                  <span className="ml-3 font-body-md text-on-surface group-hover:text-primary transition-colors">Autoriser l'impression</span>
                </label>

                <label className="flex items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-outline-variant checked:bg-secondary-container checked:border-secondary-container transition-all" 
                      checked={permissions.copy}
                      onChange={() => setPermissions({...permissions, copy: !permissions.copy})}
                    />
                    <span className="material-symbols-outlined absolute text-[14px] text-primary hidden peer-checked:block">check</span>
                  </div>
                  <span className="ml-3 font-body-md text-on-surface group-hover:text-primary transition-colors">Autoriser la copie du contenu</span>
                </label>

                <label className="flex items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-outline-variant checked:bg-secondary-container checked:border-secondary-container transition-all" 
                      checked={permissions.modify}
                      onChange={() => setPermissions({...permissions, modify: !permissions.modify})}
                    />
                    <span className="material-symbols-outlined absolute text-[14px] text-primary hidden peer-checked:block">check</span>
                  </div>
                  <span className="ml-3 font-body-md text-on-surface group-hover:text-primary transition-colors">Empêcher la modification</span>
                </label>

              </div>
            </div>

            {/* Help Box */}
            <div className="p-4 bg-tertiary-fixed/10 border-l-4 border-secondary-container">
              <p className="font-label-sm text-label-sm text-on-tertiary-fixed-variant leading-relaxed">
                Note : Le chiffrement AES-256 est irréversible sans la clé. Assurez-vous de stocker votre mot de passe en lieu sûr.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-8">
            <button 
              className={`w-full py-5 px-6 font-headline-md text-headline-md uppercase tracking-tight flex items-center justify-center gap-4 transition-all group ${appState !== 'upload' ? 'bg-surface-variant text-outline cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-secondary-container hover:text-primary active:scale-[0.98]'}`}
              onClick={startProcessing}
              disabled={appState !== 'upload'}
            >
              Protéger
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">verified_user</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
