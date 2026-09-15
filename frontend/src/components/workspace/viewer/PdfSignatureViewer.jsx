import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import axiosClient from '../../../services/api/axiosClient';
import { FileFormatError } from '../FileFormatError';

// Utiliser le worker CDN basé sur la version exacte de react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

/**
 * PdfSignatureViewer — Visualiseur pleine page pour la signature
 * Affiche une page à la fois avec un overlay draggable pour positionner la signature.
 * 
 * Conversion de coordonnées :
 *   PDF utilise un repère (0,0) en bas à gauche, en points (1pt = 1/72 inch)
 *   Le DOM utilise un repère (0,0) en haut à gauche, en pixels
 *   
 *   x_pdf = (x_dom / canvasWidth) * pageWidth_pdf
 *   y_pdf = ((canvasHeight - y_dom - sigHeight_dom) / canvasHeight) * pageHeight_pdf
 */
export const PdfSignatureViewer = ({
  fileId,
  motDePassePdf,
  signaturePreview,       // DataURL de l'aperçu de la signature
  currentPage,            // Numéro de page actuel (1-indexed)
  setCurrentPage,
  onLoadSuccess,          // Callback(totalPages)
  signaturePosition,      // { x, y } en pixels DOM relatifs au conteneur
  setSignaturePosition,
  signatureSize,          // { width, height } en pixels DOM
  setSignatureSize,
  onPdfCoordsChange,      // Callback({x, y, largeur, hauteur})
  onChangeFile
}) => {
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [pdfPageSize, setPdfPageSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Charger le PDF via axiosClient (authentifié)
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
      .catch(err => {
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
      setLoadError('Ce PDF est protégé par un mot de passe. Retirez d\'abord la protection avec l\'outil « Retirer protection ».');
    } else {
      setLoadError(
        'Ce fichier ne peut pas être prévisualisé car il n\'est pas un PDF valide.\n\n' +
        'Si votre document est au format Word, Excel ou PowerPoint, convertissez-le d\'abord en PDF via l\'outil « Office vers PDF ».'
      );
    }
  }, []);

  const onPageLoadSuccess = useCallback((page) => {
    // page.width et page.height sont les dimensions affichées (scalées)
    setPageSize({ width: page.width, height: page.height });
    
    // Obtenir les dimensions d'origine du PDF (échelle 1 = points PDF)
    const viewport = page.getViewport({ scale: 1 });
    setPdfPageSize({
      width: viewport.width,
      height: viewport.height,
    });
  }, []);

  // ── Drag logic ──
  const handleMouseDown = useCallback((e) => {
    // Vérifier si c'est sur la poignée de redimensionnement
    if (e.target.dataset.resize) {
      isResizing.current = true;
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: signatureSize.width,
        h: signatureSize.height,
      };
    } else {
      isDragging.current = true;
      dragStart.current = {
        x: e.clientX - signaturePosition.x,
        y: e.clientY - signaturePosition.y,
      };
    }
    e.preventDefault();
  }, [signaturePosition, signatureSize]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (isDragging.current) {
      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;
      // Clamp to container
      newX = Math.max(0, Math.min(newX, rect.width - signatureSize.width));
      newY = Math.max(0, Math.min(newY, rect.height - signatureSize.height));
      setSignaturePosition({ x: newX, y: newY });
    }

    if (isResizing.current) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      const newW = Math.max(40, resizeStart.current.w + dx);
      const newH = Math.max(20, resizeStart.current.h + dy);
      setSignatureSize({ width: newW, height: newH });
    }
  }, [signatureSize, setSignaturePosition, setSignatureSize]);

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

  // Adjust initial size based on image proportions
  useEffect(() => {
    if (signaturePreview && containerRef.current) {
      const img = new Image();
      img.onload = () => {
        const containerWidth = containerRef.current.offsetWidth || 600;
        const targetWidth = Math.min(img.width, containerWidth * 0.3); // max 30% width
        const ratio = img.height / img.width;
        const targetHeight = targetWidth * ratio;
        setSignatureSize({ width: targetWidth, height: targetHeight });
      };
      img.src = signaturePreview;
    }
  }, [signaturePreview, setSignatureSize]);

  // Touch support
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    if (e.target.dataset.resize) {
      isResizing.current = true;
      resizeStart.current = { x: touch.clientX, y: touch.clientY, w: signatureSize.width, h: signatureSize.height };
    } else {
      isDragging.current = true;
      dragStart.current = { x: touch.clientX - signaturePosition.x, y: touch.clientY - signaturePosition.y };
    }
    e.preventDefault();
  }, [signaturePosition, signatureSize]);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (isDragging.current) {
      let newX = touch.clientX - dragStart.current.x;
      let newY = touch.clientY - dragStart.current.y;
      newX = Math.max(0, Math.min(newX, rect.width - signatureSize.width));
      newY = Math.max(0, Math.min(newY, rect.height - signatureSize.height));
      setSignaturePosition({ x: newX, y: newY });
    }

    if (isResizing.current) {
      const dx = touch.clientX - resizeStart.current.x;
      const dy = touch.clientY - resizeStart.current.y;
      setSignatureSize({ width: Math.max(40, resizeStart.current.w + dx), height: Math.max(20, resizeStart.current.h + dy) });
    }
  }, [signatureSize, setSignaturePosition, setSignatureSize]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
  }, []);

  // Compute PDF coords and notify parent
  useEffect(() => {
    if (onPdfCoordsChange && containerRef.current && pdfPageSize.width > 0) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const coords = domToPdfCoords(signaturePosition, signatureSize, containerRect, pdfPageSize);
      onPdfCoordsChange(coords);
    }
  }, [signaturePosition, signatureSize, pdfPageSize, onPdfCoordsChange]);

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
        <FileFormatError 
          message={loadError}
          onChangeFile={onChangeFile}
          showConvert={!loadError.includes('mot de passe')} // N'afficher le bouton convertir que si ce n'est pas une erreur de MDP
        />
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
          onPassword={(callback) => {
            if (motDePassePdf) {
              callback(motDePassePdf);
            }
          }}
          loading={
            <div className="flex flex-col items-center gap-4 py-16">
              <span className="material-symbols-outlined text-[48px] text-primary animate-spin">progress_activity</span>
              <p className="text-body-md text-on-surface-variant">Chargement du document…</p>
            </div>
          }
        >
          {numPages && (
            <>
              {/* Navigation entre pages */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-label-md font-label-bold text-on-surface">
                  Page {currentPage} / {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage >= numPages}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              {/* Zone du PDF avec overlay de signature */}
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

                {/* Overlay de la signature (draggable) */}
                {signaturePreview && (
                  <div
                    className="absolute cursor-move group"
                    style={{
                      left: signaturePosition.x,
                      top: signaturePosition.y,
                      width: signatureSize.width,
                      height: signatureSize.height,
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Bordure de sélection */}
                    <div className="absolute inset-0 border-2 border-primary/60 border-dashed rounded-md group-hover:border-primary transition-colors" />
                    {/* Image de la signature */}
                    <img
                      src={signaturePreview}
                      alt="Signature"
                      className="w-full h-full object-contain pointer-events-none select-none"
                      draggable={false}
                    />
                    {/* Poignée de redimensionnement */}
                    <div
                      data-resize="true"
                      className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full cursor-se-resize border-2 border-white shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* Aide contextuelle */}
              {signaturePreview && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl mt-4">
                  <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                  <p className="text-label-sm text-primary">
                    Glissez la signature pour la positionner. Utilisez la poignée bleue pour redimensionner.
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

/**
 * Utilitaire : convertir les coordonnées DOM en coordonnées PDF
 * Appelé au moment du lancement du job (pas en temps réel)
 * 
 * @param {Object} domPos - { x, y } position en pixels dans le conteneur DOM
 * @param {Object} domSize - { width, height } taille de la signature en pixels DOM
 * @param {Object} containerSize - { width, height } taille du conteneur DOM (canvas rendu)
 * @param {Object} pdfPageSize - { width, height } taille réelle de la page PDF en points
 * @returns {Object} { x, y, largeur, hauteur } en points PDF
 */
export const domToPdfCoords = (domPos, domSize, containerSize, pdfPageSize) => {
  const scaleX = pdfPageSize.width / containerSize.width;
  const scaleY = pdfPageSize.height / containerSize.height;

  return {
    x: Math.round(domPos.x * scaleX),
    // Inversion de l'axe Y : PDF (0,0) = bas-gauche, DOM (0,0) = haut-gauche
    y: Math.round((containerSize.height - domPos.y - domSize.height) * scaleY),
    largeur: Math.round(domSize.width * scaleX),
    hauteur: Math.round(domSize.height * scaleY),
  };
};
