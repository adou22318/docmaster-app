import React, { useState, useCallback } from 'react';
import axiosClient from '../../../services/api/axiosClient';
import { traduireSelection } from '../../../utils/formatters';

/**
 * AddImageOptions — Panneau latéral épuré pour l'outil Ajout d'images.
 * L'utilisateur importe son image ici et la positionne directement
 * sur la vraie page PDF dans le visualiseur (PdfImageViewer).
 * La sélection de pages se fait via un champ texte (syntaxe "1-3, 7")
 * ou en cochant "page courante seulement" (comportement par défaut).
 */

// Conversion points PDF → cm pour l'affichage
const ptToCm = (points) => (points / 28.35).toFixed(1);

export const AddImageOptions = ({
  onStart,
  isProcessing,
  totalPages,
  // Props partagées avec PdfImageViewer (remontées depuis ToolWorkspaceLayout)
  imagePreview,
  setImagePreview,
  imageFile,
  setImageFile,
  imagePage,          // Page actuellement affichée dans le viewer
  largeur,
  setLargeur,
  hauteur,
  setHauteur,
  keepRatio,
  setKeepRatio,
  naturalRatio,
  setNaturalRatio,
  pdfCoords,          // Coordonnées calculées en temps réel par PdfImageViewer
  imagePlacements,    // Map<pageNumber, pdfCoords> — positions validées par page
  setImagePlacements, // Setter pour supprimer une entrée
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Mode de sélection des pages
  // 'current'  → page courante seulement (imagePage)
  // 'all'      → toutes les pages
  // 'custom'   → saisie manuelle "1-3, 7"
  const [pageMode, setPageMode] = useState('current');
  const [customPages, setCustomPages] = useState('');

  const handleImageSelect = useCallback((e) => {
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
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setNaturalRatio(ratio);
        setHauteur(Math.round(200 / ratio));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }, [setImageFile, setImagePreview, setNaturalRatio, setHauteur]);

  const handleLargeurChange = (val) => {
    setLargeur(val);
    if (keepRatio) setHauteur(Math.round(val / naturalRatio));
  };

  const handleHauteurChange = (val) => {
    setHauteur(val);
    if (keepRatio) setLargeur(Math.round(val * naturalRatio));
  };

  // Convertit la syntaxe "1-3, 7, 10" en tableau de numéros de pages
  const parsePagesSyntax = (str, max) => {
    const pages = new Set();
    str.split(',').forEach(part => {
      const [start, end] = part.trim().split('-').map(Number);
      if (!isNaN(start)) {
        if (!isNaN(end)) {
          for (let i = start; i <= Math.min(end, max); i++) pages.add(i);
        } else {
          if (start >= 1 && start <= max) pages.add(start);
        }
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleLaunch = async () => {
    if (!imageFile || !pdfCoords) return;
    setUploading(true);
    setUploadError(null);

    try {
      // Upload temporaire de l'image
      const formData = new FormData();
      formData.append('file', imageFile);
      const uploadRes = await axiosClient.post('/files/upload-temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!uploadRes.data.success) throw new Error(uploadRes.data.message || 'Erreur upload');
      const imageId = uploadRes.data.data.id_files;

      const hasMultiplePlacements = imagePlacements && imagePlacements.size > 0;

      if (hasMultiplePlacements && pageMode !== 'current') {
        // ── Mode hybride : toutes les pages sélectionnées reçoivent l'image ──
        // Disponible uniquement pour "Tout le document" et "Pages spécifiques"
        // Pages validées → position personnalisée
        // Pages non validées → centrage automatique par le backend
        const total = totalPages ?? 1;
        let targetPages = [];
        if (pageMode === 'all') {
          targetPages = Array.from({ length: total }, (_, i) => i + 1);
        } else if (pageMode === 'custom' && customPages.trim()) {
          targetPages = parsePagesSyntax(customPages.trim(), total);
        }

        // Construire le tableau complet de placements
        const placementsArray = targetPages.map(page => {
          if (imagePlacements.has(page)) {
            // Position personnalisée validée par l'utilisateur
            return imagePlacements.get(page);
          } else {
            // Position par défaut : centrage automatique par le backend
            // On n'envoie PAS x/y → le backend utilise position:'centre'
            return {
              page,
              position: 'centre',
              largeur: pdfCoords.largeur,
              hauteur: pdfCoords.hauteur,
            };
          }
        });

        onStart({ placements: placementsArray }, [imageId]);
      } else {
        // ── Mode classique : coordonnées simples + sélection de pages ──
        const options = {
          x: pdfCoords.x,
          y: pdfCoords.y,
          largeur: pdfCoords.largeur,
          hauteur: pdfCoords.hauteur,
        };
        if (pageMode === 'current') {
          options.pages = String(imagePage ?? 1);
        } else if (pageMode === 'custom' && customPages.trim()) {
          options.pages = customPages.trim();
        }
        // 'all' → pas de pages → le backend applique à tout le document
        onStart(options, [imageId]);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  };

  const hasMultiplePlacements = imagePlacements && imagePlacements.size > 0;
  const canLaunch = imageFile && (hasMultiplePlacements || pdfCoords) && !isProcessing && !uploading;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Ajouter une image</h3>
          <p className="text-body-sm text-on-surface-variant">
            Importez votre image, puis glissez-la sur la page pour la positionner.
          </p>
        </div>

        {/* Zone d'upload */}
        <div className="space-y-2">
          <label className="text-label-md font-label-bold text-on-surface">Image à incruster</label>

          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Aperçu"
                className="w-full rounded-xl border border-outline-variant object-contain max-h-40"
              />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1.5 bg-error text-on-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
              <p className="text-label-sm text-on-surface-variant mt-1">
                {imageFile?.name} — {imageFile ? (imageFile.size / 1024).toFixed(0) : 0} Ko
              </p>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant">add_photo_alternate</span>
              <p className="text-body-sm text-on-surface-variant text-center">
                Cliquez pour choisir une image
                <span className="text-label-sm block">PNG ou JPG, max 5 Mo</span>
              </p>
              <input type="file" accept="image/png,image/jpeg" onChange={handleImageSelect} className="hidden" />
            </label>
          )}
        </div>

        {uploadError && (
          <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/30 rounded-xl">
            <span className="material-symbols-outlined text-[16px] text-error mt-0.5">error</span>
            <p className="text-body-sm text-error">{uploadError}</p>
          </div>
        )}

        {/* Liste des placements validés */}
        {imagePlacements && imagePlacements.size > 0 && (
          <div className="space-y-2">
            <label className="text-label-md font-label-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-green-600">push_pin</span>
              Positions validées
            </label>
            <div className="space-y-1.5">
              {Array.from(imagePlacements.entries()).sort((a, b) => a[0] - b[0]).map(([page, coords]) => (
                <div key={page} className="flex items-center justify-between gap-2 p-2.5 bg-green-500/8 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-green-600">check_circle</span>
                    <span className="text-label-sm text-on-surface">
                      Page {page}
                      <span className="text-label-xs text-on-surface-variant ml-1">
                        ({(coords.x / 28.35).toFixed(1)}&nbsp;cm, {(coords.y / 28.35).toFixed(1)}&nbsp;cm)
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => setImagePlacements(prev => { const next = new Map(prev); next.delete(page); return next; })}
                    className="p-1 text-on-surface-variant hover:text-error transition-colors"
                    title="Supprimer ce placement"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-label-xs text-on-surface-variant italic">
              Chaque page recevra l'image à la position indiquée.
            </p>
          </div>
        )}

        {/* Sélection de pages (uniquement si aucun placement multi-page) */}
        {imagePreview && !hasMultiplePlacements && (
          <div className="space-y-2">
            <label className="text-label-md font-label-bold text-on-surface">Pages cibles</label>
            <div className="space-y-2">
              {/* Page courante */}
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  border-outline-variant hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="pageMode"
                  value="current"
                  checked={pageMode === 'current'}
                  onChange={() => setPageMode('current')}
                  className="accent-primary"
                />
                <div>
                  <p className="text-label-sm font-label-bold text-on-surface">Page courante</p>
                  <p className="text-label-xs text-on-surface-variant">
                    Page visible dans le visualiseur ({imagePage ?? 1})
                  </p>
                </div>
              </label>

              {/* Toutes les pages */}
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  border-outline-variant hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="pageMode"
                  value="all"
                  checked={pageMode === 'all'}
                  onChange={() => setPageMode('all')}
                  className="accent-primary"
                />
                <div>
                  <p className="text-label-sm font-label-bold text-on-surface">Tout le document</p>
                  <p className="text-label-xs text-on-surface-variant">
                    Image incrustée sur chacune des {totalPages ?? '…'} pages
                  </p>
                </div>
              </label>

              {/* Pages personnalisées */}
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  border-outline-variant hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="pageMode"
                  value="custom"
                  checked={pageMode === 'custom'}
                  onChange={() => setPageMode('custom')}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <p className="text-label-sm font-label-bold text-on-surface">Pages spécifiques</p>
                  <p className="text-label-xs text-on-surface-variant">ex : 1-3, 7, 10</p>
                </div>
              </label>

              {pageMode === 'custom' && (
                <input
                  type="text"
                  placeholder="ex : 1-3, 7, 10"
                  value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  autoFocus
                />
              )}
            </div>
          </div>
        )}

        {/* Dimensions */}
        {imagePreview && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-label-md font-label-bold text-on-surface">Dimensions (pt)</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepRatio}
                  onChange={(e) => setKeepRatio(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-label-sm text-on-surface-variant">Ratio</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Largeur</label>
                <input
                  type="number"
                  min="20"
                  max="800"
                  value={largeur}
                  onChange={(e) => handleLargeurChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Hauteur</label>
                <input
                  type="number"
                  min="20"
                  max="800"
                  value={hauteur}
                  onChange={(e) => handleHauteurChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <p className="text-label-sm text-on-surface-variant">
              ≈ {ptToCm(largeur)} cm × {ptToCm(hauteur)} cm
            </p>
          </div>
        )}

        {/* Position actuelle */}
        {pdfCoords && imagePreview && (
          <div className="p-3 bg-surface-container rounded-xl">
            <p className="text-label-sm font-label-bold text-on-surface mb-1">Position actuelle</p>
            <p className="text-label-sm text-on-surface-variant">
              X : {(pdfCoords.x / 28.35).toFixed(1)} cm &nbsp;|&nbsp; Y : {(pdfCoords.y / 28.35).toFixed(1)} cm
            </p>
            <p className="text-label-xs text-on-surface-variant italic mt-0.5">
              Glissez l'image sur la page pour ajuster.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-outline-variant space-y-2">
        {imageFile && !pdfCoords && (
          <p className="text-label-sm text-on-surface-variant text-center">
            Positionnez l'image sur la page pour continuer.
          </p>
        )}
        <button
          onClick={handleLaunch}
          disabled={!canLaunch}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-on-primary rounded-xl font-label-bold text-label-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          {uploading || isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              {uploading ? 'Upload en cours…' : 'Traitement…'}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
              Incruster l'image
            </>
          )}
        </button>
      </div>
    </div>
  );
};
