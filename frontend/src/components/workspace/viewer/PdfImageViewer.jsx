import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import axiosClient from '../../../services/api/axiosClient';
import { FileFormatError } from '../FileFormatError';
import { domToPdfCoords } from './PdfSignatureViewer';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

/**
 * PdfImageViewer — Visualiseur pleine page pour l'outil "Ajouter une image".
 * Affiche la page PDF sélectionnée et permet de glisser/redimensionner l'image
 * importée directement dessus, comme pour la signature.
 *
 * Nouveauté : bouton "Valider la position — page X" pour enregistrer un placement
 * indépendant par page. La navigation entre pages restaure automatiquement la position
 * précédemment validée pour chaque page.
 */
export const PdfImageViewer = ({
  fileId,
  motDePassePdf,
  imagePreview,
  currentPage,
  setCurrentPage,
  onLoadSuccess,
  imagePosition,
  setImagePosition,
  imageSize,
  setImageSize,
  onPdfCoordsChange,
  imagePlacements,       // Map<pageNumber, pdfCoords>
  setImagePlacements,
  onChangeFile,
}) => {
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [pdfPageSize, setPdfPageSize] = useState({ width: 0, height: 0 });
  const [justValidated, setJustValidated] = useState(false); // feedback visuel

  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // ── Chargement authentifié du PDF ──
  useEffect(() => {
    if (!fileId) return;
    let cancelled = false;
    setPdfLoading(true);
    setLoadError(null);

    axiosClient.get(`/files/stream/${fileId}`, { responseType: 'arraybuffer' })
      .then(res => {
        if (!cancelled) {
          setPdfData({ data: new Uint8Array(res.data) });
          setPdfLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Impossible de charger le document.');
          setPdfLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [fileId]);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
    onLoadSuccess?.(n);
  }, [onLoadSuccess]);

  const onDocumentLoadError = useCallback((error) => {
    const msg = error?.message || '';
    if (msg.includes('PasswordException') || error?.name === 'PasswordException') {
      setLoadError('Ce PDF est protégé par un mot de passe. Retirez d\'abord la protection.');
    } else {
      setLoadError('Ce fichier ne peut pas être prévisualisé.\n\nSi votre document est au format Word, Excel ou PowerPoint, convertissez-le d\'abord en PDF.');
    }
  }, []);

  const onPageLoadSuccess = useCallback((page) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfPageSize({ width: viewport.width, height: viewport.height });
  }, []);

  // ── Ajuster la taille initiale selon les proportions de l'image ──
  useEffect(() => {
    if (imagePreview && containerRef.current) {
      const img = new Image();
      img.onload = () => {
        const containerWidth = containerRef.current.offsetWidth || 600;
        const targetWidth = Math.min(img.width, containerWidth * 0.3);
        const ratio = img.height / img.width;
        setImageSize({ width: targetWidth, height: targetWidth * ratio });
        const containerHeight = containerRef.current.offsetHeight || 800;
        setImagePosition({
          x: (containerWidth - targetWidth) / 2,
          y: (containerHeight - targetWidth * ratio) / 2,
        });
      };
      img.src = imagePreview;
    }
  }, [imagePreview, setImageSize, setImagePosition]);

  // ── Restaurer la position sauvegardée quand on change de page ──
  useEffect(() => {
    if (!imagePlacements || !containerRef.current || !pdfPageSize.width) return;
    const saved = imagePlacements.get(currentPage);
    if (saved && containerRef.current) {
      // Convertir les coords PDF → pixels DOM pour repositionner l'overlay
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = rect.width / pdfPageSize.width;
      const scaleY = rect.height / pdfPageSize.height;
      // Inversion axe Y : PDF bas-gauche → CSS haut-gauche
      const domX = saved.x * scaleX;
      const domY = (pdfPageSize.height - saved.y - saved.hauteur) * scaleY;
      const domW = saved.largeur * scaleX;
      const domH = saved.hauteur * scaleY;
      setImagePosition({ x: domX, y: domY });
      setImageSize({ width: domW, height: domH });
    }
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Valider la position courante pour la page courante ──
  const handleValiderPlacement = useCallback(() => {
    if (!containerRef.current || !pdfPageSize.width) return;
    const rect = containerRef.current.getBoundingClientRect();
    const coords = domToPdfCoords(imagePosition, imageSize, rect, pdfPageSize);
    setImagePlacements(prev => {
      const next = new Map(prev);
      next.set(currentPage, { ...coords, page: currentPage });
      return next;
    });
    setJustValidated(true);
    setTimeout(() => setJustValidated(false), 1500);
  }, [imagePosition, imageSize, pdfPageSize, currentPage, setImagePlacements]);

  // ── Drag (souris) ──
  const handleMouseDown = useCallback((e) => {
    if (e.target.dataset.resize) {
      isResizing.current = true;
      resizeStart.current = { x: e.clientX, y: e.clientY, w: imageSize.width, h: imageSize.height };
    } else {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y };
    }
    e.preventDefault();
  }, [imagePosition, imageSize]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (isDragging.current) {
      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;
      newX = Math.max(0, Math.min(newX, rect.width - imageSize.width));
      newY = Math.max(0, Math.min(newY, rect.height - imageSize.height));
      setImagePosition({ x: newX, y: newY });
    }
    if (isResizing.current) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setImageSize({ width: Math.max(40, resizeStart.current.w + dx), height: Math.max(20, resizeStart.current.h + dy) });
    }
  }, [imageSize, setImagePosition, setImageSize]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ── Touch ──
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    if (e.target.dataset.resize) {
      isResizing.current = true;
      resizeStart.current = { x: touch.clientX, y: touch.clientY, w: imageSize.width, h: imageSize.height };
    } else {
      isDragging.current = true;
      dragStart.current = { x: touch.clientX - imagePosition.x, y: touch.clientY - imagePosition.y };
    }
    e.preventDefault();
  }, [imagePosition, imageSize]);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (isDragging.current) {
      let newX = touch.clientX - dragStart.current.x;
      let newY = touch.clientY - dragStart.current.y;
      newX = Math.max(0, Math.min(newX, rect.width - imageSize.width));
      newY = Math.max(0, Math.min(newY, rect.height - imageSize.height));
      setImagePosition({ x: newX, y: newY });
    }
    if (isResizing.current) {
      const dx = touch.clientX - resizeStart.current.x;
      const dy = touch.clientY - resizeStart.current.y;
      setImageSize({ width: Math.max(40, resizeStart.current.w + dx), height: Math.max(20, resizeStart.current.h + dy) });
    }
  }, [imageSize, setImagePosition, setImageSize]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
  }, []);

  // ── Calcul des coordonnées PDF en temps réel (mode page courante) ──
  useEffect(() => {
    if (onPdfCoordsChange && containerRef.current && pdfPageSize.width > 0) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const coords = domToPdfCoords(imagePosition, imageSize, containerRect, pdfPageSize);
      onPdfCoordsChange(coords);
    }
  }, [imagePosition, imageSize, pdfPageSize, onPdfCoordsChange]);

  const isPageValidated = imagePlacements?.has(currentPage);

  if (!fileId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] mb-4">description</span>
        <p className="text-body-md">Aucun fichier sélectionné.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <FileFormatError message={loadError} onChangeFile={onChangeFile} showConvert={!loadError.includes('mot de passe')} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {pdfLoading && (
        <div className="flex flex-col items-center gap-4 py-16">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin">progress_activity</span>
          <p className="text-body-md text-on-surface-variant">Téléchargement du document…</p>
        </div>
      )}

      {pdfData && (
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          onPassword={(callback) => { if (motDePassePdf) callback(motDePassePdf); }}
          loading={
            <div className="flex flex-col items-center gap-4 py-16">
              <span className="material-symbols-outlined text-[48px] text-primary animate-spin">progress_activity</span>
              <p className="text-body-md text-on-surface-variant">Chargement du document…</p>
            </div>
          }
        >
          {numPages && (
            <>
              {/* Navigation */}
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {/* Indicateurs de pages validées */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map(page => {
                    const isValidated = imagePlacements?.has(page);
                    const isCurrent = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-full text-label-xs font-label-bold border-2 transition-all ${
                          isCurrent
                            ? 'border-primary bg-primary text-on-primary scale-110'
                            : isValidated
                            ? 'border-green-500 bg-green-500/10 text-green-700'
                            : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/50'
                        }`}
                        title={`Page ${page}${isValidated ? ' ✓ validée' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage >= numPages}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              {/* Zone PDF avec image draggable */}
              <div
                ref={containerRef}
                className="relative mx-auto border border-outline-variant rounded-xl overflow-hidden shadow-sm bg-white w-fit"
                style={{ maxWidth: '100%' }}
              >
                <Page
                  pageNumber={currentPage}
                  width={Math.min(600, containerRef.current?.offsetWidth || 600)}
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />

                {/* Badge "validé" pour la page courante */}
                {isPageValidated && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-label-xs font-label-bold shadow">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Validée
                  </div>
                )}

                {/* Overlay image draggable */}
                {imagePreview && (
                  <div
                    className="absolute cursor-move group"
                    style={{ left: imagePosition.x, top: imagePosition.y, width: imageSize.width, height: imageSize.height }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className={`absolute inset-0 border-2 border-dashed rounded-md transition-colors ${isPageValidated ? 'border-green-500' : 'border-primary/60 group-hover:border-primary'}`} />
                    <img src={imagePreview} alt="Image à incruster" className="w-full h-full object-contain pointer-events-none select-none" draggable={false} />
                    <div data-resize="true" className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full cursor-se-resize border-2 border-white shadow-md" />
                  </div>
                )}
              </div>

              {/* Bouton Valider la position */}
              {imagePreview && (
                <div className="flex flex-col items-center gap-3 mt-4">
                  <button
                    onClick={handleValiderPlacement}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-bold text-label-md border-2 transition-all ${
                      justValidated
                        ? 'bg-green-500 border-green-500 text-white'
                        : isPageValidated
                        ? 'bg-green-500/10 border-green-500 text-green-700 hover:bg-green-500/20'
                        : 'bg-primary/5 border-primary text-primary hover:bg-primary/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {justValidated ? 'check_circle' : isPageValidated ? 'edit_location' : 'push_pin'}
                    </span>
                    {justValidated ? 'Position validée !' : isPageValidated ? 'Modifier la position — page ' + currentPage : 'Valider la position — page ' + currentPage}
                  </button>

                  <p className="text-label-xs text-on-surface-variant text-center">
                    {imagePlacements?.size > 0
                      ? `${imagePlacements.size} page${imagePlacements.size > 1 ? 's' : ''} validée${imagePlacements.size > 1 ? 's' : ''}. Naviguez entre les pages pour ajouter d'autres positions.`
                      : 'Glissez l\'image puis validez sa position. Naviguez entre les pages pour un positionnement différent par page.'}
                  </p>
                </div>
              )}

              {!imagePreview && (
                <div className="flex items-center gap-2 p-3 bg-surface-container border border-outline-variant rounded-xl mt-4">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">add_photo_alternate</span>
                  <p className="text-label-sm text-on-surface-variant">
                    Importez une image dans le panneau de droite pour la positionner sur cette page.
                  </p>
                </div>
              )}
            </>
          )}
        </Document>
      )}
    </div>
  );
};
