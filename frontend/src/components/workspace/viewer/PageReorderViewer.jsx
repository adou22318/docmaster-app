import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosClient from '../../../services/api/axiosClient';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker PDF.js — meme version que PdfThumbnailViewer
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// ────────────────────────────────────────────────────────────────
// Skeleton de chargement
// ────────────────────────────────────────────────────────────────
const ThumbnailSkeleton = ({ width }) => (
  <div
    className="rounded-xl bg-surface-container animate-pulse"
    style={{ width, height: width * 1.41 }}
  />
);

// ────────────────────────────────────────────────────────────────
// Carte d une page draggable
// ────────────────────────────────────────────────────────────────
const PageCard = ({
  pageNumOriginal,
  positionActuelle,
  totalPages,
  thumbWidth,
  pdfUrl,
  isDragging,
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const positionModifiee = positionActuelle !== pageNumOriginal;

  return (
    <div
      className={`flex flex-col items-center gap-2 select-none transition-opacity duration-150 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ width: thumbWidth }}
    >
      {/* Miniature */}
      <div
        className={`relative rounded-xl overflow-hidden border-2 transition-colors duration-150 ${
          isDragging
            ? 'border-primary shadow-lg shadow-primary/20'
            : 'border-outline-variant hover:border-primary/50'
        }`}
        style={{ width: thumbWidth, height: Math.round(thumbWidth * 1.41) }}
      >
        {!isRendered && <ThumbnailSkeleton width={thumbWidth} />}
        <div className={isRendered ? 'block' : 'hidden'}>
          <Document file={pdfUrl} loading={null}>
            <Page
              pageNumber={pageNumOriginal}
              width={thumbWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onRenderSuccess={() => setIsRendered(true)}
            />
          </Document>
        </div>

        {/* Handle grip */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-[14px] text-white drop-shadow">drag_indicator</span>
        </div>
      </div>

      {/* Numero original */}
      <span className="text-label-xs text-on-surface-variant">
        Page {pageNumOriginal}
      </span>

      {/* Badge position actuelle si modifiee */}
      {positionModifiee && (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full text-label-xs font-label-bold">
          <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          Pos. {positionActuelle}
        </span>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : PageReorderViewer
// ════════════════════════════════════════════════════════════════
/**
 * @param {string}   fileId           - UUID du fichier source
 * @param {string}   motDePassePdf    - mot de passe si PDF protege
 * @param {Function} onOrderChange    - callback(newOrder: number[]) emis a chaque deplacement
 * @param {Function} onLoadSuccess    - callback(numPages: number) emis une fois au chargement
 */
export const PageReorderViewer = ({ fileId, motDePassePdf, onOrderChange, onLoadSuccess }) => {
  const [numPages, setNumPages] = useState(null);
  // pageOrder : [pageNumOriginal, ...] dans l ordre d affichage actuel
  // ex: [3,1,2] = page originale 3 en pos 1, originale 1 en pos 2, originale 2 en pos 3
  const [pageOrder, setPageOrder] = useState([]);
  const [thumbSize, setThumbSize] = useState(140);
  const [loadError, setLoadError] = useState(null);

  const pdfUrl = fileId
    ? { url: `${axiosClient.defaults.baseURL}/files/download/${fileId}`, httpHeaders: {} }
    : null;

  // Charge le PDF et initialise l ordre
  const handleLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
    const ordreInitial = Array.from({ length: n }, (_, i) => i + 1);
    setPageOrder(ordreInitial);
    if (onOrderChange) onOrderChange(ordreInitial);
    if (onLoadSuccess) onLoadSuccess(n);
  }, [onOrderChange, onLoadSuccess]);

  // Fin du drag : met a jour l ordre et notifie le parent
  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    setPageOrder(prev => {
      const items = Array.from(prev);
      const [moved] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, moved);
      if (onOrderChange) onOrderChange(items);
      return items;
    });
  }, [onOrderChange]);

  // Remet l ordre original
  const resetOrder = useCallback(() => {
    if (!numPages) return;
    const ordreOriginal = Array.from({ length: numPages }, (_, i) => i + 1);
    setPageOrder(ordreOriginal);
    if (onOrderChange) onOrderChange(ordreOriginal);
  }, [numPages, onOrderChange]);

  const ordreModifie = numPages && pageOrder.some((p, i) => p !== i + 1);

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="material-symbols-outlined text-[48px] text-error">error</span>
        <p className="text-body-md text-on-surface-variant">
          Impossible de charger le PDF. Vérifiez que le fichier n&apos;est pas corrompu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre d outils */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-1">
        <div className="flex items-center gap-2">
          {numPages && (
            <span className="text-label-sm text-on-surface-variant">
              {numPages} page{numPages > 1 ? 's' : ''}
              {ordreModifie
                ? <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full text-label-xs font-label-bold">
                    <span className="material-symbols-outlined text-[12px]">warning</span> Ordre modifié
                  </span>
                : <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full text-label-xs">
                    Ordre original
                  </span>
              }
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Bouton reset */}
          {ordreModifie && (
            <button
              onClick={resetOrder}
              className="flex items-center gap-1.5 text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">undo</span>
              Remettre l&apos;ordre d&apos;origine
            </button>
          )}

          {/* Slider zoom */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">photo_size_select_small</span>
            <input
              type="range"
              min={100}
              max={220}
              step={10}
              value={thumbSize}
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
          Glissez-déposez les vignettes pour modifier l&apos;ordre des pages. Confirmez en cliquant sur <strong>Réorganiser le PDF</strong>.
        </p>
      </div>

      {/* Grille D&D */}
      <Document
        file={pdfUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={() => setLoadError(true)}
        loading={
          <div className="flex items-center gap-3 p-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
            <span className="text-body-sm">Chargement du document…</span>
          </div>
        }
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="page-reorder" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-4 p-2"
              >
                {pageOrder.map((pageNumOriginal, index) => (
                  <Draggable
                    key={`page-${pageNumOriginal}`}
                    draggableId={`page-${pageNumOriginal}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="group cursor-grab active:cursor-grabbing"
                        style={provided.draggableProps.style}
                      >
                        <PageCard
                          pageNumOriginal={pageNumOriginal}
                          positionActuelle={index + 1}
                          totalPages={numPages}
                          thumbWidth={thumbSize}
                          pdfUrl={pdfUrl}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Document>
    </div>
  );
};
