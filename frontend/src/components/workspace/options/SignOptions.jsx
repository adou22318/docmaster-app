import React, { useState, useRef, useCallback, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axiosClient from '../../../services/api/axiosClient';

/**
 * SignOptions — Panneau latéral pour la Signature Électronique
 * 3 onglets : Dessiner, Texte, Importer
 * Upload proactif de la signature vers /upload-temp
 */

const FONTS = [
  { id: 'caveat', family: "'Caveat', cursive", label: 'Caveat' },
  { id: 'dancing', family: "'Dancing Script', cursive", label: 'Dancing Script' },
  { id: 'great-vibes', family: "'Great Vibes', cursive", label: 'Great Vibes' },
];

const DRAW_COLORS = [
  { id: 'black', value: '#000000', label: 'Noir' },
  { id: 'blue',  value: '#1a53ff', label: 'Bleu' },
  { id: 'red',   value: '#d32f2f', label: 'Rouge' },
];

export const SignOptions = ({
  onStart,
  isProcessing,
  signaturePreview,
  setSignaturePreview,
  signaturePage,
  setSignaturePage,
  totalPages,
  addDate,
  setAddDate,
}) => {
  const [activeTab, setActiveTab] = useState('draw');  // 'draw' | 'text' | 'import'
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2.5);
  const [textValue, setTextValue] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [importedImage, setImportedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadWarning, setUploadWarning] = useState(null);
  const [whiteBackgroundWarning, setWhiteBackgroundWarning] = useState(false);
  const [pageError, setPageError] = useState('');

  const [historySignature, setHistorySignature] = useState(() => sessionStorage.getItem('docmaster_signature_history'));

  const sigCanvasRef = useRef(null);

  // Charger les Google Fonts calligraphiques
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&display=swap';
    link.rel = 'stylesheet';
    if (!document.head.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }
  }, []);

  // ── Onglet Dessiner ──
  const handleClearDraw = () => {
    sigCanvasRef.current?.clear();
    if (activeTab === 'draw') setSignaturePreview(null);
  };

  const handleUndoDraw = () => {
    const data = sigCanvasRef.current?.toData();
    if (data && data.length > 0) {
      data.pop();
      sigCanvasRef.current?.fromData(data);
      handleEndDraw();
    }
  };

  const handleEndDraw = () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      setSignaturePreview(null);
      return;
    }
    // Utiliser toDataURL au lieu de getTrimmedCanvas (crash trimCanvas)
    const dataUrl = sigCanvasRef.current.toDataURL('image/png');
    setSignaturePreview(dataUrl);
    sessionStorage.setItem('docmaster_signature_history', dataUrl);
    setHistorySignature(dataUrl);
  };

  // ── Onglet Texte ──
  const generateTextSignature = useCallback(() => {
    if (!textValue.trim()) {
      setSignaturePreview(null);
      return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontSize = 48;
    ctx.font = `${fontSize}px ${selectedFont.family}`;
    const metrics = ctx.measureText(textValue);
    const width = Math.ceil(metrics.width) + 20;
    const height = fontSize + 20;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px ${selectedFont.family}`;
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'middle';
    ctx.fillText(textValue, 10, height / 2);
    const dataUrl = canvas.toDataURL('image/png');
    setSignaturePreview(dataUrl);
    sessionStorage.setItem('docmaster_signature_history', dataUrl);
    setHistorySignature(dataUrl);
  }, [textValue, selectedFont, setSignaturePreview]);

  useEffect(() => {
    if (activeTab === 'text') {
      generateTextSignature();
    }
  }, [activeTab, textValue, selectedFont, generateTextSignature]);

  // ── Onglet Importer ──
  const checkTransparency = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let hasTransparent = false;
        // Check alpha channel
        for (let i = 3; i < imageData.length; i += 4) {
          if (imageData[i] < 255) {
            hasTransparent = true;
            break;
          }
        }
        resolve(hasTransparent);
      };
      img.src = dataUrl;
    });
  };

  const handleImageImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setUploadError('Format non supporté. Utilisez PNG ou JPG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image trop lourde (max 5 Mo).');
      return;
    }
    setUploadError(null);
    setUploadWarning(null);
    setImportedImage(file);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const hasTransparent = await checkTransparency(dataUrl);
      if (!hasTransparent) {
        setWhiteBackgroundWarning(true);
      } else {
        setWhiteBackgroundWarning(false);
      }
      setSignaturePreview(dataUrl);
      sessionStorage.setItem('docmaster_signature_history', dataUrl);
      setHistorySignature(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // ── Lancement ──
  const handleSigner = async () => {
    if (!signaturePreview) return;
    
    const p = parseInt(signaturePage, 10);
    if (isNaN(p) || p < 1 || (totalPages && p > totalPages)) {
      setPageError(`Le numéro de page doit être entre 1 et ${totalPages || '?'}.`);
      return;
    }
    setPageError('');

    setUploading(true);
    setUploadError(null);

    try {
      // Convertir le dataURL en Blob pour l'upload
      let blob;
      if (activeTab === 'import' && importedImage) {
        blob = importedImage;
      } else {
        const res = await fetch(signaturePreview);
        blob = await res.blob();
      }

      const formData = new FormData();
      formData.append('file', blob, 'signature.png');

      const uploadRes = await axiosClient.post('/files/upload-temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!uploadRes.data.success) {
        throw new Error(uploadRes.data.message || 'Erreur upload');
      }

      const signatureId = uploadRes.data.data.id_files;

      const options = {
        page: String(signaturePage),
        ajouterDate: addDate,
      };

      onStart(options, [signatureId]);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'draw', label: 'Dessiner', icon: 'draw' },
    { id: 'text', label: 'Texte', icon: 'text_fields' },
    { id: 'import', label: 'Importer', icon: 'upload_file' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Créer votre signature</h3>
          <p className="text-body-sm text-on-surface-variant">
            Dessinez, tapez ou importez votre signature ci-dessous.
          </p>
        </div>

        {/* Mention légale eIDAS — obligatoire (cf. AGENTS.md) */}
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="material-symbols-outlined text-[14px] text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">info</span>
          <p className="text-label-xs text-amber-700 dark:text-amber-400">
            Signature électronique simple — non certifiée eIDAS. Elle n'a pas de valeur légale probante sans accord contractuel préalable.
          </p>
        </div>

        {/* Onglets */}
        <div className="flex rounded-xl bg-surface-container p-1 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-label-sm font-label-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu de l'onglet */}
        {activeTab === 'draw' && (
          <div className="space-y-3">
            <div className="relative bg-white border-2 border-dashed border-outline-variant rounded-xl overflow-hidden" style={{ height: '160px' }}>
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor={penColor}
                minWidth={penWidth * 0.5}
                maxWidth={penWidth * 1.5}
                canvasProps={{
                  className: 'w-full h-full',
                  style: { width: '100%', height: '100%' },
                }}
                onEnd={handleEndDraw}
              />
              {/* Placeholder */}
              {(!sigCanvasRef.current || sigCanvasRef.current?.isEmpty?.()) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-body-sm text-on-surface-variant/40">Dessinez ici…</p>
                </div>
              )}
            </div>

            {/* Contrôles dessin */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {DRAW_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setPenColor(c.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      penColor === c.value ? 'border-primary scale-110' : 'border-outline-variant'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleUndoDraw}
                  className="flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">undo</span>
                  Annuler trait
                </button>
                <button
                  onClick={handleClearDraw}
                  className="flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Effacer
                </button>
              </div>
            </div>

            {/* Épaisseur du trait */}
            <div className="flex items-center gap-3">
              <span className="text-label-sm text-on-surface-variant">Épaisseur</span>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={penWidth}
                onChange={(e) => setPenWidth(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Votre nom ou signature"
              maxLength={40}
              className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />

            {/* Choix de police */}
            <div className="space-y-2">
              <label className="text-label-md font-label-bold text-on-surface">Police</label>
              <div className="space-y-2">
                {FONTS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedFont.id === font.id
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant hover:border-primary/50'
                    }`}
                  >
                    <span className="text-[24px]" style={{ fontFamily: font.family }}>
                      {textValue || 'Aperçu'}
                    </span>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">{font.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="space-y-3">
            {importedImage ? (
              <div className="relative group">
                <div className="w-full aspect-video bg-surface-container rounded-xl overflow-hidden border border-outline-variant flex items-center justify-center p-4">
                  <img src={signaturePreview} alt="Signature importée" className="max-w-full max-h-full object-contain" />
                </div>
                <button
                  onClick={() => { setImportedImage(null); setSignaturePreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-error text-on-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
                <p className="text-label-sm text-on-surface-variant mt-1">{importedImage.name}</p>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant">upload_file</span>
                <p className="text-body-sm text-on-surface-variant text-center">
                  Importez votre signature ou glissez-la ici
                  <span className="text-label-sm block">PNG transparent recommandé ou JPG</span>
                </p>
                <input type="file" accept="image/png,image/jpeg" onChange={handleImageImport} className="hidden" />
              </label>
            )}
          </div>
        )}

        {/* Aperçu de la signature */}
        {signaturePreview ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-label-md font-label-bold text-on-surface">Votre signature</label>
              <button
                onClick={() => {
                  setSignaturePreview(null);
                  sigCanvasRef.current?.clear();
                }}
                className="text-label-sm font-label-bold text-error hover:underline transition-colors"
              >
                Recommencer
              </button>
            </div>
            <div className="w-full bg-white border border-outline-variant rounded-xl p-4 flex items-center justify-center" style={{ minHeight: '80px' }}>
              <img src={signaturePreview} alt="Aperçu signature" className="max-w-full max-h-20 object-contain" />
            </div>
            <p className="text-label-sm text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Signature prise en compte — positionnez-la sur le document
            </p>
          </div>
        ) : (historySignature && activeTab !== 'draw' && activeTab !== 'text' && !importedImage) ? (
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-label-md font-label-bold text-on-surface">Signature récente</label>
              <button onClick={() => setSignaturePreview(historySignature)} className="text-primary text-label-sm hover:underline font-label-bold">Réutiliser</button>
            </div>
            <div className="w-full bg-white border border-outline-variant rounded-xl p-4 flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer transition-all" onClick={() => setSignaturePreview(historySignature)} style={{ minHeight: '80px' }}>
              <img src={historySignature} alt="Historique signature" className="max-w-full max-h-20 object-contain" />
            </div>
          </div>
        ) : null}

        {/* Options communes */}
        <div className="space-y-3 pt-2 border-t border-outline-variant">
          {/* Page de destination */}
          <div className="space-y-2">
            <label className="text-label-md font-label-bold text-on-surface">Page de signature</label>
            <div className="flex items-center gap-2">
              {/* Bouton précédente */}
              <button
                type="button"
                onClick={() => {
                  const next = Math.max(1, parseInt(signaturePage, 10) - 1);
                  setSignaturePage(next);
                  setPageError('');
                }}
                disabled={parseInt(signaturePage, 10) <= 1}
                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant disabled:opacity-30 transition-all"
                title="Page précédente"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {/* Input centré */}
              <div className="flex flex-col gap-1 flex-1">
                <input
                  type="number"
                  min="1"
                  max={totalPages || 1}
                  value={signaturePage}
                  onChange={(e) => {
                    const raw = e.target.value;
                    // Permettre la saisie libre mais ne propager que des entiers valides
                    const p = parseInt(raw, 10);
                    if (!isNaN(p) && p >= 1 && (!totalPages || p <= totalPages)) {
                      setSignaturePage(p);
                      setPageError('');
                    } else {
                      // Garder la valeur affichée pour UX mais signaler l'erreur
                      setPageError(`Entre 1 et ${totalPages || '?'}`);
                    }
                  }}
                  onBlur={(e) => {
                    const p = parseInt(e.target.value, 10);
                    if (isNaN(p) || p < 1 || (totalPages && p > totalPages)) {
                      setSignaturePage(1);
                      setPageError('');
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 text-center ${
                    pageError
                      ? 'border-error focus:ring-error/20'
                      : 'border-outline-variant focus:ring-primary'
                  }`}
                />
                {pageError && (
                  <span className="text-error text-label-sm">{pageError}</span>
                )}
              </div>

              {/* Bouton suivante */}
              <button
                type="button"
                onClick={() => {
                  const next = Math.min(totalPages || Infinity, parseInt(signaturePage, 10) + 1);
                  setSignaturePage(next);
                  setPageError('');
                }}
                disabled={!!totalPages && parseInt(signaturePage, 10) >= totalPages}
                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant disabled:opacity-30 transition-all"
                title="Page suivante"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>

              <span className="text-body-sm text-on-surface-variant whitespace-nowrap">/ {totalPages || '?'}</span>
            </div>
          </div>

          {/* Date automatique */}
          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={addDate}
              onChange={(e) => setAddDate(e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <div>
              <p className="text-label-md font-label-bold text-on-surface">Ajouter la date</p>
              <p className="text-label-sm text-on-surface-variant">Insère la date du jour à côté de la signature</p>
            </div>
          </label>
        </div>

        {uploadWarning && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-amber-400 mt-0.5">warning</span>
            <p className="text-body-sm text-amber-700 dark:text-amber-400">{uploadWarning}</p>
          </div>
        )}

        {whiteBackgroundWarning && (
          <div className="flex flex-col gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-600 dark:text-amber-400 mt-0.5">warning</span>
              <div>
                <p className="text-label-md font-label-bold text-amber-700 dark:text-amber-400">Fond blanc détecté</p>
                <p className="text-body-sm text-amber-700 dark:text-amber-400 mt-1">
                  Votre signature masquera le contenu du document à son emplacement.
                </p>
                <p className="text-body-sm text-amber-700 dark:text-amber-400 mt-2 font-label-bold">Pour un meilleur rendu :</p>
                <ul className="list-disc pl-4 text-body-sm text-amber-700 dark:text-amber-400 mt-1 space-y-1">
                  <li>Utilisez l'onglet "Dessiner" pour créer une signature avec fond transparent automatique.</li>
                  <li>Ou convertissez votre image en PNG transparent avec un outil gratuit comme remove.bg.</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => setWhiteBackgroundWarning(false)}
                className="px-3 py-1.5 text-label-sm font-label-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
              >
                Continuer quand même
              </button>
              <button
                onClick={() => {
                  setWhiteBackgroundWarning(false);
                  setImportedImage(null);
                  setSignaturePreview(null);
                  setActiveTab('draw');
                }}
                className="px-3 py-1.5 text-label-sm font-label-bold bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
              >
                Aller à l'onglet Dessiner
              </button>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/30 rounded-xl">
            <span className="material-symbols-outlined text-[16px] text-error mt-0.5">error</span>
            <p className="text-body-sm text-error">{uploadError}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-outline-variant">
        <button
          onClick={handleSigner}
          disabled={isProcessing || uploading || !signaturePreview}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-on-primary rounded-xl font-label-bold text-label-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          {uploading || isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              {uploading ? 'Préparation…' : 'Traitement…'}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">history_edu</span>
              Appliquer la signature
            </>
          )}
        </button>
      </div>
    </div>
  );
};
