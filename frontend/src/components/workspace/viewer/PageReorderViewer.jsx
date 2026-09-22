import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axiosClient from '../../../services/api/axiosClient';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Miniature individuelle avec lazy loading (IntersectionObserver)
// Utilise le contexte du <Document> parent â€” pas de <Document> imbriquÃ©.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LazyPageThumbnail = ({ pageNum, thumbWidth, isDragging, isDropTarget }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        'relative rounded-xl overflow-hidden border-2 transition-all duration-150',
        isDragging
          ? 'opacity-40 scale-95 border-primary shadow-lg'
          : isDropTarget
          ? 'border-primary ring-2 ring-primary/30 scale-105'
          : 'border-outline-variant hover:border-primary/50',
      ].join(' ')}
      style={{ width: thumbWidth, height: Math.round(thumbWidth * 1.41) }}
    >
      {!isRendered && (
        <div className="absolute inset-0 bg-surface-container animate-pulse rounded-xl" />
      )}
      {isVisible && (
        <Page
          pageNumber={pageNum}
          width={thumbWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onRenderSuccess={() => setIsRendered(true)}
        />
      )}
      {/* IcÃ´ne drag handle */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="material-symbols-outlined text-[16px] text-on-surface/60 drop-shadow">drag_indicator</span>
      </div>
    </div>
  );
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Carte d'une page â€” HTML5 DnD natif (pas de bibliothÃ¨que externe)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PageCard = React.memo(({
  pageNumOriginal,
  positionActuelle,
  thumbWidth,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const positionModifiee = positionActuelle !== pageNumOriginal;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="group flex flex-col items-center gap-2 select-none cursor-grab active:cursor-grabbing"
      style={{ width: thumbWidth }}
    >
      <LazyPageThumbnail
        pageNum={pageNumOriginal}
        thumbWidth={thumbWidth}
        isDragging={isDragging}
        isDropTarget={isDropTarget}
      />

      <span className="text-label-xs text-on-surface-variant">
        Page {pageNumOriginal}
      </span>

      {positionModifiee && (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full text-label-xs font-label-bold">
          <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          Pos.&nbsp;{positionActuelle}
        </span>
      )}
    </div>
  );
});

PageCard.displayName = 'PageCard';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COMPOSANT PRINCIPAL : PageReorderViewer
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
/**
 * @param {string}   fileId         - UUID du fichier source
 * @param {string}   motDePassePdf  - mot de passe si PDF protÃ©gÃ©
 * @param {Function} onOrderChange  - callback(newOrder: number[]) Ã©mis aprÃ¨s chaque dÃ©placement
 * @param {Function} onLoadSuccess  - callback(numPages: number) Ã©mis une fois au chargement
 */
export const PageReorderViewer = ({ fileId, motDePassePdf, onOrderChange, onLoadSuccess }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageOrder, setPageOrder] = useState([]);
  const [thumbSize, setThumbSize] = useState(140);
  const [loadError, setLoadError] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Drag state
  const draggingIndexRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  // Ref pour Ã©viter le setState-pendant-render dans handleLoadSuccess
  const pendingCallbacksRef = useRef(null);

  // â”€â”€ TÃ©lÃ©chargement du PDF via axiosClient (JWT inclus) â”€â”€
  useEffect(() => {
    if (!fileId) return;
    let cancelled = false;
    setPdfLoading(true);
    setPdfData(null);
    setLoadError(null);
    setNumPages(null);
    setPageOrder([]);

    axiosClient.get(`/files/download/${fileId}`, { responseType: 'arraybuffer' })
      .then((response) => {
        if (!cancelled) {
          setPdfData({ data: response.data });
          setPdfLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPdfLoading(false);
          setLoadError(
            err.response?.status === 404
              ? 'Fichier introuvable ou expirÃ©. RÃ©importez votre PDF.'
              : 'Impossible de tÃ©lÃ©charger le fichier. VÃ©rifiez votre connexion.'
          );
        }
      });

    return () => { cancelled = true; };
  }, [fileId]);

  // AppelÃ© par react-pdf quand le document est analysÃ©
  const handleLoadSuccess = useCallback(({ numPages: n }) => {
    const ordreInitial = Array.from({ length: n }, (_, i) => i + 1);
    setNumPages(n);
    setPageOrder(ordreInitial);
    // Stocker dans une ref pour Ã©viter setState-during-render
    pendingCallbacksRef.current = { order: ordreInitial, n };
  }, []);

  // Notifier le parent APRÃˆS le rendu (useEffect sans dÃ©pendances)
  useEffect(() => {
    if (pendingCallbacksRef.current) {
      const { order, n } = pendingCallbacksRef.current;
      pendingCallbacksRef.current = null;
      if (onOrderChange) onOrderChange(order);
      if (onLoadSuccess) onLoadSuccess(n);
    }
  });

  // â”€â”€ Handlers HTML5 DnD natifs â”€â”€
  const handleDragStart = useCallback((index) => (e) => {
    draggingIndexRef.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // NÃ©cessaire pour Firefox
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragEnter = useCallback((index) => (e) => {
    e.preventDefault();
    setOverIndex(index);
  }, []);

  const handleDragOver = useCallback((index) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) setOverIndex(index);
  }, [overIndex]);

  const handleDrop = useCallback((index) => (e) => {
    e.preventDefault();
    const from = draggingIndexRef.current;
    if (from === null || from === index) {
      setDraggingIndex(null);
      setOverIndex(null);
      return;
    }
    setPageOrder(prev => {
      const items = Array.from(prev);
      const [moved] = items.splice(from, 1);
      items.splice(index, 0, moved);
      if (onOrderChange) onOrderChange(items);
      return items;
    });
    draggingIndexRef.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
  }, [onOrderChange]);

  const handleDragEnd = useCallback(() => {
    draggingIndexRef.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
  }, []);

  // â”€â”€ Remise en ordre original â”€â”€
  const resetOrder = useCallback(() => {
    if (!numPages) return;
    const original = Array.from({ length: numPages }, (_, i) => i + 1);
    setPageOrder(original);
    if (onOrderChange) onOrderChange(original);
  }, [numPages, onOrderChange]);

  const ordreModifie = numPages != null && pageOrder.some((p, i) => p !== i + 1);

  // â”€â”€ Ã‰tats de chargement / erreur â”€â”€
  if (pdfLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">progress_activity</span>
        <p className="text-body-md text-on-surface-variant">TÃ©lÃ©chargement du documentâ€¦</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="material-symbols-outlined text-[48px] text-error">error</span>
        <p className="text-body-md text-on-surface-variant max-w-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-1">
        <div className="flex items-center gap-2">
          {numPages && (
            <span className="text-label-sm text-on-surface-variant">
              {numPages} page{numPages > 1 ? 's' : ''}
              {ordreModifie ? (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full text-label-xs font-label-bold">
                  <span className="material-symbols-outlined text-[12px]">warning</span> Ordre modifiÃ©
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full text-label-xs">
                  Ordre original
                </span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {ordreModifie && (
            <button
              onClick={resetOrder}
              className="flex items-center gap-1.5 text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">undo</span>
              Remettre l&apos;ordre d&apos;origine
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">photo_size_select_small</span>
            <input
              type="range" min={100} max={220} step={10} value={thumbSize}
              onChange={e => setThumbSize(Number(e.target.value))}
              className="w-20 accent-primary"
            />
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">photo_size_select_large</span>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl">
        <span className="material-symbols-outlined text-[16px] text-primary">drag_pan</span>
        <p className="text-body-sm text-on-surface-variant">
          Glissez-dÃ©posez les vignettes pour modifier l&apos;ordre des pages. Confirmez via <strong>RÃ©organiser le PDF</strong>.
        </p>
      </div>

      {/* Grille D&D */}
      {pdfData && (
        <Document
          file={pdfData}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={() => setLoadError('Impossible de lire ce PDF. VÃ©rifiez qu\'il n\'est pas corrompu ou protÃ©gÃ© par un mot de passe.')}
          loading={
            <div className="flex items-center gap-3 p-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px] animate-spin text-primary">progress_activity</span>
              <span className="text-body-sm">Analyse du documentâ€¦</span>
            </div>
          }
        >
          <div
            className="flex flex-wrap gap-4 p-2"
            onDragOver={(e) => e.preventDefault()}
          >
            {pageOrder.map((pageNumOriginal, index) => (
              <PageCard
                key={pageNumOriginal}
                pageNumOriginal={pageNumOriginal}
                positionActuelle={index + 1}
                thumbWidth={thumbSize}
                isDragging={draggingIndex === index}
                isDropTarget={overIndex === index && draggingIndex !== index}
                onDragStart={handleDragStart(index)}
                onDragEnter={handleDragEnter(index)}
                onDragOver={handleDragOver(index)}
                onDrop={handleDrop(index)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </Document>
      )}
    </div>
  );
};

