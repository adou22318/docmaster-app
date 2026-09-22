import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axiosClient from '../../../services/api/axiosClient';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// ────────────────────────────────────────────────────────────────
// Dialogue de mot de passe pour PDF protégé
// ────────────────────────────────────────────────────────────────
const PasswordDialog = ({ onSubmit }) => {
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[42px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
      </div>
      <div>
        <h3 className="font-display-xl text-title-md text-on-surface mb-1">PDF protégé par mot de passe</h3>
        <p className="text-body-md text-on-surface-variant">Saisissez le mot de passe pour afficher les pages.</p>
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(password); }}
        className="flex gap-2 w-full max-w-xs"
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="flex-1 px-4 py-3 border border-outline-variant rounded-xl bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        <button
          type="submit"
          disabled={!password}
          className="px-4 py-3 bg-primary text-on-primary rounded-xl font-label-bold disabled:opacity-50 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">lock_open</span>
        </button>
      </form>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// Barre de progression globale du chargement des vignettes
// Pattern identique à PdfThumbnailViewer
// ────────────────────────────────────────────────────────────────
const LoadingProgress = ({ loaded, total }) => {
  if (total === 0) return null;
  const pct = Math.round((loaded / total) * 100);
  return (
    <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl mb-4">
      <span className="material-symbols-outlined text-[18px] text-primary animate-spin">progress_activity</span>
      <div className="flex-1">
        <div className="h-1.5 bg-outline-variant rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-label-sm text-on-surface-variant whitespace-nowrap">
        {loaded} / {total} pages
      </span>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// Miniature individuelle — isVisible piloté par l'observer parent
// Pattern identique à PdfThumbnailViewer
// ────────────────────────────────────────────────────────────────
const PageThumbnail = ({ pageNum, thumbWidth, isDragging, isDropTarget, isVisible, onRenderSuccess }) => {
  return (
    <div
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
      {isVisible ? (
        <Page
          pageNumber={pageNum}
          width={thumbWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div
              className="bg-surface-container animate-pulse rounded-xl"
              style={{ width: thumbWidth, height: Math.round(thumbWidth * 1.41) }}
            />
          }
          onRenderSuccess={onRenderSuccess}
        />
      ) : (
        <div
          className="bg-surface-container animate-pulse rounded-xl"
          style={{ width: thumbWidth, height: Math.round(thumbWidth * 1.41) }}
        />
      )}

      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="material-symbols-outlined text-[16px] text-on-surface/60 drop-shadow">drag_indicator</span>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// Carte d'une page — HTML5 DnD natif
// thumbRef fourni par le parent pour l'IntersectionObserver global
// ────────────────────────────────────────────────────────────────
const PageCard = React.memo(({
  pageNumOriginal,
  positionActuelle,
  thumbWidth,
  isDragging,
  isDropTarget,
  isVisible,
  thumbRef,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
  onDragEnd,
  onRenderSuccess,
}) => {
  const positionModifiée = positionActuelle !== pageNumOriginal;

  return (
    <div
      ref={thumbRef}
      data-page={pageNumOriginal}
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="group flex flex-col items-center gap-2 select-none cursor-grab active:cursor-grabbing"
    >
      <PageThumbnail
        pageNum={pageNumOriginal}
        thumbWidth={thumbWidth}
        isDragging={isDragging}
        isDropTarget={isDropTarget}
        isVisible={isVisible}
        onRenderSuccess={onRenderSuccess}
      />

      <span className="text-label-xs text-on-surface-variant">
        Page {pageNumOriginal}
      </span>

      {positionModifiée && (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full text-label-xs font-label-bold">
          <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          Pos.&nbsp;{positionActuelle}
        </span>
      )}
    </div>
  );
});

PageCard.displayName = 'PageCard';

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : PageReorderViewer
// Pattern de chargement identique à PdfThumbnailViewer :
//   - axiosClient + arraybuffer
//   - Un seul IntersectionObserver global (observerRef / sentinelRefs)
//   - visiblePages = Set des numéros de pages dans le viewport
//   - Stratégie "once-visible-always-visible" : une page chargée reste chargée
//   - LoadingProgress : barre de progression identique
//   - Grille CSS auto-fill identique
// ════════════════════════════════════════════════════════════════
export const PageReorderViewer = ({ fileId, motDePassePdf, onOrderChange, onLoadSuccess, onPasswordSubmit }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageOrder, setPageOrder] = useState([]);
  const [thumbSize, setThumbSize] = useState(140);
  const [loadError, setLoadError] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [pdfPassword, setPdfPassword] = useState(motDePassePdf || null);
  const pdfPasswordRef = useRef(motDePassePdf || null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const originalBufferRef = useRef(null);

  // Progression du rendu des vignettes (comme PdfThumbnailViewer)
  const [renderedCount, setRenderedCount] = useState(0);

  // Observer unique global — même pattern que PdfThumbnailViewer
  const observerRef = useRef(null);
  const sentinelRefs = useRef({});
  const [visiblePages, setVisiblePages] = useState(new Set());

  // Drag state
  const draggingIndexRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  // ── Téléchargement du PDF via axiosClient (JWT inclus) ──
  useEffect(() => {
    if (!fileId) return;
    let cancelled = false;
    setPdfLoading(true);
    setPdfData(null);
    setLoadError(null);
    setNumPages(null);
    setPageOrder([]);
    setVisiblePages(new Set());
    setRenderedCount(0);

    axiosClient.get(`/files/download/${fileId}`, { responseType: 'arraybuffer' })
      .then((response) => {
        if (!cancelled) {
          originalBufferRef.current = response.data;
          setPdfData({ data: response.data.slice(0) });
          setPdfLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPdfLoading(false);
          setLoadError(
            err.response?.status === 404
              ? 'Fichier introuvable ou expiré. Réimportez votre PDF.'
              : 'Impossible de télécharger le fichier. Vérifiez votre connexion.'
          );
        }
      });

    return () => { cancelled = true; };
  }, [fileId]);

  // ── IntersectionObserver global (créé une seule fois) ──
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisiblePages(prev => {
          let changed = false;
          const next = new Set(prev);
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const pageNum = Number(entry.target.dataset.page);
              if (!next.has(pageNum)) {
                next.add(pageNum);
                changed = true;
              }
            }
            // Ne pas supprimer : une fois chargée, la vignette reste rendue.
            // Évite le rechargement à chaque scroll / changement de taille.
          });
          return changed ? next : prev;
        });
      },
      { rootMargin: '200px 0px' }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  // ── Observer les sentinelles quand numPages change ──
  // thumbSize exclu volontairement : le resize ne nécessite pas de re-observer
  // puisque les pages ne se déchargent plus (once-visible-always-visible).
  useEffect(() => {
    if (!numPages || !observerRef.current) return;
    const observer = observerRef.current;
    Object.values(sentinelRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [numPages]);

  // ── Callback de rendu de page (incrémente le compteur de progression) ──
  const onPageRenderSuccess = useCallback(() => {
    setRenderedCount(c => c + 1);
  }, []);

  // ── Appelé par react-pdf quand le document est analysé ──
  const handleLoadSuccess = useCallback(({ numPages: n }) => {
    setNeedsPassword(false);
    setLoadError(null);
    const ordreInitial = Array.from({ length: n }, (_, i) => i + 1);
    setNumPages(n);
    setPageOrder(ordreInitial);
    setRenderedCount(0);
    // setTimeout(0) : diffère les setState parent hors du cycle de rendu react-pdf
    setTimeout(() => {
      if (onOrderChange) onOrderChange(ordreInitial);
      if (onLoadSuccess) onLoadSuccess(n);
    }, 0);
  }, [onOrderChange, onLoadSuccess]);

  const handleLoadError = useCallback((error) => {
    const msg = error?.message || '';
    if (msg.includes('PasswordException') || error?.name === 'PasswordException') {
      setNeedsPassword(true);
    } else {
      setLoadError(
        'Ce fichier ne peut pas être prévisualisé car il n\'est pas un PDF valide.\n\n' +
        'Si votre fichier est bien un PDF mais qu\'il s\'affiche pas, il est peut-être corrompu ou protégé par un mot de passe.'
      );
    }
  }, []);

  // ── Handlers HTML5 DnD natifs ──
  const handleDragStart = useCallback((index) => (e) => {
    draggingIndexRef.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
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

  // ── Remise en ordre original ──
  const resetOrder = useCallback(() => {
    if (!numPages) return;
    const original = Array.from({ length: numPages }, (_, i) => i + 1);
    setPageOrder(original);
    if (onOrderChange) onOrderChange(original);
  }, [numPages, onOrderChange]);

  const ordreModifié = numPages != null && pageOrder.some((p, i) => p !== i + 1);

  const handlePasswordSubmit = useCallback((pwd) => {
    pdfPasswordRef.current = pwd;
    setPdfPassword(pwd);
    setNeedsPassword(false);
    if (originalBufferRef.current) {
      setPdfData({ data: originalBufferRef.current.slice(0) }); // Clone du buffer pour éviter ArrayBuffer detached
    }
    if (onPasswordSubmit) onPasswordSubmit(pwd);
  }, [onPasswordSubmit]);

  // ── États de chargement / erreur ──
  if (needsPassword) {
    return <PasswordDialog onSubmit={handlePasswordSubmit} />;
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="material-symbols-outlined text-[48px] text-error">error</span>
        <p className="text-body-md text-on-surface-variant max-w-sm whitespace-pre-line">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Spinner téléchargement (identique à PdfThumbnailViewer) */}
      {pdfLoading && (
        <div className="flex flex-col items-center gap-4 py-16">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin">progress_activity</span>
          <p className="text-body-md text-on-surface-variant">Téléchargement du document…</p>
        </div>
      )}

      {pdfData && (
        <Document
          file={pdfData}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          onPassword={(callback, reason) => {
            if (pdfPasswordRef.current) {
              callback(pdfPasswordRef.current);
            } else {
              setNeedsPassword(true);
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
              {/* Barre d'outils */}
              <div className="flex items-center justify-between flex-wrap gap-3 px-1 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-label-sm text-on-surface-variant">
                    {numPages} page{numPages > 1 ? 's' : ''}
                    {ordreModifié ? (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full text-label-xs font-label-bold">
                        <span className="material-symbols-outlined text-[12px]">warning</span> Ordre modifié
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full text-label-xs">
                        Ordre original
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {ordreModifié && (
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
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl mb-4">
                <span className="material-symbols-outlined text-[16px] text-primary">drag_pan</span>
                <p className="text-body-sm text-on-surface-variant">
                  Glissez-déposez les vignettes pour modifier l&apos;ordre des pages. Confirmez via <strong>Réorganiser le PDF</strong>.
                </p>
              </div>

              {/* Barre de progression des rendus (identique à PdfThumbnailViewer) */}
              {renderedCount < numPages && (
                <LoadingProgress loaded={renderedCount} total={numPages} />
              )}

              {/* Grille de vignettes — auto-fill identique à PdfThumbnailViewer */}
              <div
                className="grid gap-4 justify-items-center"
                style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(${thumbSize}px, 1fr))`,
                }}
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
                    isVisible={visiblePages.has(pageNumOriginal)}
                    thumbRef={(el) => {
                      sentinelRefs.current[pageNumOriginal] = el;
                      if (el && observerRef.current) observerRef.current.observe(el);
                    }}
                    onDragStart={handleDragStart(index)}
                    onDragEnter={handleDragEnter(index)}
                    onDragOver={handleDragOver(index)}
                    onDrop={handleDrop(index)}
                    onDragEnd={handleDragEnd}
                    onRenderSuccess={onPageRenderSuccess}
                  />
                ))}
              </div>
            </>
          )}
        </Document>
      )}
    </div>
  );
};
