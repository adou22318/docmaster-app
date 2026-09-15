import React, { useState } from 'react';
import { traduireSelection } from '../../../utils/formatters';

/**
 * ExtractImagesOptions — Panneau latéral pour Extraire des images
 * Fonctionnalités :
 *   - Périmètre : toutes les pages ou seulement les pages sélectionnées
 *   - Dimensionnement : taille originale (défaut) ou dimensions personnalisées
 *   - Aperçu visuel de la taille cible
 *   - Format de sortie : original / PNG / JPG
 */

// Référence visuelle pour l'aperçu : largeur max du bloc en px DOM
const PREVIEW_BOX_W = 200;
const PREVIEW_BOX_H = 120;

// Calcule les dimensions d'affichage du rectangle d'aperçu (fit-inside)
const calcPreviewRect = (w, h) => {
  if (!w && !h) return { pw: PREVIEW_BOX_W * 0.6, ph: PREVIEW_BOX_H * 0.6 };
  const aspect = w && h ? w / h : w ? 1.5 : 0.67;
  if (aspect >= PREVIEW_BOX_W / PREVIEW_BOX_H) {
    const pw = PREVIEW_BOX_W * 0.9;
    return { pw, ph: Math.round(pw / aspect) };
  } else {
    const ph = PREVIEW_BOX_H * 0.9;
    return { pw: Math.round(ph * aspect), ph };
  }
};

// Calcule la taille brute non compressée = taille maximale théorique
// (largeur × hauteur × 3 canaux RGB)
// C'est une borne supérieure garantie : la taille du fichier final compressé sera toujours inférieure.
const calculerTailleRaw = (w, h) => {
  if (!w || !h || w <= 0 || h <= 0) return null;
  const octets = w * h * 3;
  if (octets >= 1024 * 1024) return (octets / (1024 * 1024)).toFixed(1) + ' Mo';
  return (octets / 1024).toFixed(0) + ' Ko';
};

export const ExtractImagesOptions = ({ onStart, isProcessing, selection = [], totalPages }) => {
  // ── Périmètre ──
  const [extractMode, setExtractMode] = useState('all');

  // ── Dimensionnement ──
  const [sizeMode, setSizeMode] = useState('original');
  const [largeur, setLargeur] = useState('');
  const [hauteur, setHauteur] = useState('');
  const [conserverRatio, setConserverRatio] = useState(true);
  const [ratioSaisi, setRatioSaisi] = useState(null);

  // ── Format ──
  const [format, setFormat] = useState('original');

  const handleLargeurChange = (val) => {
    setLargeur(val);
    const w = parseInt(val, 10);
    const h = parseInt(hauteur, 10);
    if (conserverRatio && ratioSaisi && w > 0) {
      setHauteur(String(Math.round(w / ratioSaisi)));
    }
    if (w > 0 && h > 0) setRatioSaisi(w / h);
  };

  const handleHauteurChange = (val) => {
    setHauteur(val);
    const w = parseInt(largeur, 10);
    const h = parseInt(val, 10);
    if (conserverRatio && ratioSaisi && h > 0) {
      setLargeur(String(Math.round(h * ratioSaisi)));
    }
    if (w > 0 && h > 0) setRatioSaisi(w / h);
  };

  const handleLaunch = () => {
    const options = {};
    if (extractMode === 'selection' && selection.length > 0) {
      const selString = traduireSelection(selection);
      options.pages = selString;
      options.selection = selString;
    }
    if (sizeMode === 'custom') {
      const w = parseInt(largeur, 10);
      const h = parseInt(hauteur, 10);
      if (w > 0) options.largeur = w;
      if (h > 0) options.hauteur = h;
      options.conserverRatio = conserverRatio;
    }
    if (format !== 'original') options.format = format;
    onStart(options);
  };

  const canLaunch = !isProcessing && !(extractMode === 'selection' && selection.length === 0);

  // Valeurs numériques pour l'aperçu
  const previewW = parseInt(largeur, 10) || 0;
  const previewH = parseInt(hauteur, 10) || 0;
  const { pw, ph } = calcPreviewRect(previewW, previewH);
  const tailleRaw = calculerTailleRaw(previewW, previewH);

  const formats = [
    { value: 'original', label: 'Original', desc: 'JPEG reste JPG, PNG reste PNG' },
    { value: 'png', label: 'PNG', desc: 'Sans perte, transparence supportée' },
    { value: 'jpg', label: 'JPG', desc: 'Compact, idéal pour les photos' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Extraire les images</h3>
          <p className="text-body-sm text-on-surface-variant">
            Récupérez les images incorporées dans votre PDF (photos, logos, graphiques).
          </p>
        </div>

        {/* ── Périmètre ── */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Périmètre</p>
          {[
            { value: 'all', label: 'Toutes les pages', desc: `Extraire les images de l'ensemble du document (${totalPages || '…'} pages).` },
            { value: 'selection', label: 'Pages sélectionnées uniquement', desc: selection.length > 0 ? `${selection.length} page${selection.length > 1 ? 's' : ''} sélectionnée${selection.length > 1 ? 's' : ''}` : 'Cliquez sur les pages dans le visualiseur' },
          ].map(opt => (
            <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              extractMode === opt.value ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
            }`}>
              <input type="radio" name="extractMode" checked={extractMode === opt.value}
                onChange={() => setExtractMode(opt.value)} className="mt-0.5 accent-primary" />
              <div>
                <p className="text-label-md font-label-bold text-on-surface">{opt.label}</p>
                <p className="text-body-sm text-on-surface-variant">{opt.desc}</p>
              </div>
            </label>
          ))}
          {extractMode === 'selection' && selection.length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5">info</span>
              <p className="text-body-sm text-amber-700">Sélectionnez au moins une page dans le visualiseur.</p>
            </div>
          )}
        </div>

        {/* ── Dimensionnement ── */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Dimensionnement</p>
          {[
            { value: 'original', label: 'Taille originale', desc: 'Chaque image est extraite à ses dimensions natives dans le PDF.' },
            { value: 'custom', label: 'Dimensions personnalisées', desc: 'Redimensionner toutes les images extraites.' },
          ].map(opt => (
            <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              sizeMode === opt.value ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
            }`}>
              <input type="radio" name="sizeMode" checked={sizeMode === opt.value}
                onChange={() => setSizeMode(opt.value)} className="mt-0.5 accent-primary" />
              <div>
                <p className="text-label-md font-label-bold text-on-surface">{opt.label}</p>
                <p className="text-body-sm text-on-surface-variant">{opt.desc}</p>
              </div>
            </label>
          ))}

          {/* Champs + aperçu visuel */}
          {sizeMode === 'custom' && (
            <div className="space-y-4 pt-1">
              {/* Inputs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-label-sm text-on-surface-variant">Dimensions en pixels</p>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={conserverRatio}
                      onChange={(e) => setConserverRatio(e.target.checked)} className="accent-primary" />
                    <span className="text-label-sm text-on-surface-variant">Ratio</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label-xs text-on-surface-variant mb-1 block">Largeur (px)</label>
                    <input type="number" min="16" max="8000" placeholder="ex : 1920" value={largeur}
                      onChange={(e) => handleLargeurChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-label-xs text-on-surface-variant mb-1 block">Hauteur (px)</label>
                    <input type="number" min="16" max="8000" placeholder="ex : 1080" value={hauteur}
                      onChange={(e) => handleHauteurChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                {!conserverRatio && largeur && hauteur && (
                  <p className="text-label-xs text-amber-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    Les images seront étirées pour correspondre exactement à ces dimensions.
                  </p>
                )}
              </div>

              {/* Aperçu visuel */}
              <div className="p-4 bg-surface-container rounded-xl space-y-3">
                <p className="text-label-sm font-label-bold text-on-surface">Aperçu de la taille</p>
                <div
                  className="relative mx-auto flex items-center justify-center bg-surface rounded-lg border border-outline-variant"
                  style={{ width: PREVIEW_BOX_W, height: PREVIEW_BOX_H }}
                >
                  {/* Rectangle représentant l'image cible */}
                  <div
                    className="flex flex-col items-center justify-center bg-primary/10 border-2 border-primary/40 rounded transition-all duration-300"
                    style={{ width: pw, height: ph }}
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary/60">image</span>
                    {(previewW > 0 || previewH > 0) && (
                      <span className="text-[9px] text-primary/70 font-bold mt-0.5">
                        {previewW || '?'}×{previewH || '?'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  {previewW > 0 || previewH > 0 ? (
                    <>
                      <p className="text-label-sm text-on-surface">
                        {previewW > 0 && previewH > 0 ? `${previewW} × ${previewH} pixels` : previewW > 0 ? `${previewW} px de large` : `${previewH} px de haut`}
                      </p>
                      {tailleRaw && previewW > 0 && previewH > 0 && (
                        <div className="space-y-0.5">
                          <p className="text-label-xs text-on-surface-variant">
                            Taille brute max : <span className="font-label-bold text-on-surface">{tailleRaw}</span>
                          </p>
                          <p className="text-label-xs text-on-surface-variant/70 italic">
                            Le fichier compressé sera plus léger selon le contenu.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-label-xs text-on-surface-variant italic">
                      Saisissez au moins une dimension pour prévisualiser.
                    </p>
                  )}
                </div>

                {/* Références de résolution communes */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    { label: 'HD', w: 1280, h: 720 },
                    { label: 'Full HD', w: 1920, h: 1080 },
                    { label: '4K', w: 3840, h: 2160 },
                    { label: 'A4', w: 2480, h: 3508 },
                  ].map(ref => (
                    <button key={ref.label} onClick={() => {
                      setLargeur(String(ref.w));
                      setHauteur(String(ref.h));
                      setRatioSaisi(ref.w / ref.h);
                    }}
                      className="px-2 py-0.5 text-label-xs border border-outline-variant rounded-full text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      {ref.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Format de sortie ── */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Format de sortie</p>
          <div className="space-y-2">
            {formats.map(opt => (
              <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                format === opt.value ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/40'
              }`}>
                <input type="radio" name="format" checked={format === opt.value}
                  onChange={() => setFormat(opt.value)} className="mt-0.5 accent-primary" />
                <div>
                  <p className={`text-label-sm font-label-bold ${format === opt.value ? 'text-primary' : 'text-on-surface'}`}>
                    {opt.label}
                  </p>
                  <p className="text-label-xs text-on-surface-variant">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Info ── */}
        <div className="flex items-start gap-2 p-3 bg-surface-container rounded-xl">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5 flex-shrink-0">info</span>
          <p className="text-body-sm text-on-surface-variant">
            Seules les images <strong>embarquées nativement</strong> dans le PDF sont extraites.
            Le texte et les éléments de mise en page sont ignorés.
          </p>
        </div>
      </div>

      {/* ── Bouton lancer ── */}
      <div className="p-6 border-t border-outline-variant">
        <button onClick={handleLaunch} disabled={!canLaunch}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md">
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Extraction en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">image</span>
              Extraire les images
            </>
          )}
        </button>
      </div>
    </div>
  );
};
