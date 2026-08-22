import React, { useState, useCallback } from 'react';
import axiosClient from '../../../services/api/axiosClient';
import { traduireSelection } from '../../../utils/formatters';

/**
 * AddImageOptions — Panneau latéral pour l'outil Ajout d'images
 * Upload d'une image + grille 3x3 pour le positionnement + dimensions.
 * L'image est uploadée via /upload-temp et son ID est passé en extraFiles.
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

// Conversion points PDF → cm pour l'affichage
const pointsToCm = (points) => (points * 2.54 / 72).toFixed(1);

export const AddImageOptions = ({ onStart, isProcessing, selection = [], totalPages }) => {
  const [imageFile, setImageFile] = useState(null);       // File object local
  const [imagePreview, setImagePreview] = useState(null);  // DataURL pour aperçu
  const [position, setPosition] = useState('centre');
  const [largeur, setLargeur] = useState(200);  // en points PDF
  const [hauteur, setHauteur] = useState(200);
  const [keepRatio, setKeepRatio] = useState(true);
  const [naturalRatio, setNaturalRatio] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification format
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setUploadError('Format non supporté. Utilisez PNG ou JPG.');
      return;
    }
    // Vérification taille (5 Mo max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image trop lourde (max 5 Mo).');
      return;
    }

    setUploadError(null);
    setImageFile(file);

    // Aperçu et ratio naturel
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setNaturalRatio(ratio);
        // Ajuster la hauteur selon le ratio
        setHauteur(Math.round(200 / ratio));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleLargeurChange = (val) => {
    setLargeur(val);
    if (keepRatio) setHauteur(Math.round(val / naturalRatio));
  };

  const handleHauteurChange = (val) => {
    setHauteur(val);
    if (keepRatio) setLargeur(Math.round(val * naturalRatio));
  };

  const handleLaunch = async () => {
    if (!imageFile) return;
    setUploading(true);
    setUploadError(null);

    try {
      // 1. Upload temporaire de l'image
      const formData = new FormData();
      formData.append('file', imageFile);
      const uploadRes = await axiosClient.post('/files/upload-temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!uploadRes.data.success) {
        throw new Error(uploadRes.data.message || 'Erreur upload');
      }

      const imageId = uploadRes.data.data.id_files;

      // 2. Préparer les options
      const options = {
        position,
        largeur,
        hauteur,
      };

      // Pages sélectionnées
      if (selection.length > 0 && selection.length < totalPages) {
        options.pages = traduireSelection(selection);
      }

      // 3. Appeler onStart avec extraFiles
      onStart(options, [imageId]);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  };

  const previewPositionStyle = () => {
    switch (position) {
      case 'haut-gauche':  return { top: '10%', left: '10%' };
      case 'haut-centre':  return { top: '10%', left: '50%', transform: 'translateX(-50%)' };
      case 'haut-droite':  return { top: '10%', right: '10%' };
      case 'centre':       return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'bas-gauche':   return { bottom: '10%', left: '10%' };
      case 'bas-centre':   return { bottom: '10%', left: '50%', transform: 'translateX(-50%)' };
      case 'bas-droite':   return { bottom: '10%', right: '10%' };
      default:             return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Ajouter une image</h3>
          <p className="text-body-sm text-on-surface-variant">
            {selection.length > 0
              ? `Image incrustée sur ${selection.length} page${selection.length > 1 ? 's' : ''} sélectionnée${selection.length > 1 ? 's' : ''}.`
              : 'Sélectionnez des pages ou appliquez sur tout le document.'}
          </p>
        </div>

        {/* Zone d'upload d'image */}
        <div className="space-y-2">
          <label className="text-label-md font-label-bold text-on-surface">Image à incruster</label>
          {imagePreview ? (
            <div className="relative group">
              <div className="w-full aspect-[3/4] bg-white rounded-xl overflow-hidden border border-outline-variant shadow-inner relative">
                {/* Lignes fictives de texte */}
                <div className="absolute inset-0 p-6 space-y-2">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-2 bg-gray-200 rounded" style={{ width: `${60 + (i * 7) % 35}%` }} />
                  ))}
                </div>
                {/* Image overlay */}
                <img 
                  src={imagePreview} 
                  alt="Aperçu" 
                  className="absolute object-contain pointer-events-none"
                  style={{
                    ...previewPositionStyle(),
                    width: `${Math.min(100, (largeur / 595) * 100)}%`,
                    height: `${Math.min(100, (hauteur / 842) * 100)}%`
                  }}
                />
              </div>
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1.5 bg-error text-on-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
              <p className="text-label-sm text-on-surface-variant mt-1">{imageFile.name} — {(imageFile.size / 1024).toFixed(0)} Ko</p>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant">add_photo_alternate</span>
              <p className="text-body-sm text-on-surface-variant text-center">
                Cliquez pour choisir une image<br />
                <span className="text-label-sm">PNG ou JPG, max 5 Mo</span>
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

        {/* Grille 3x3 de positionnement */}
        <div className="space-y-2">
          <label className="text-label-md font-label-bold text-on-surface">Position sur la page</label>
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

        {/* Dimensions */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-label-md font-label-bold text-on-surface">Dimensions</label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={keepRatio}
                onChange={(e) => setKeepRatio(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-label-sm text-on-surface-variant">Conserver le ratio</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-1 block">Largeur (pt)</label>
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
              <label className="text-label-sm text-on-surface-variant mb-1 block">Hauteur (pt)</label>
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
            ≈ {pointsToCm(largeur)} cm × {pointsToCm(hauteur)} cm sur le document
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-outline-variant">
        <button
          onClick={handleLaunch}
          disabled={isProcessing || uploading || !imageFile}
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
