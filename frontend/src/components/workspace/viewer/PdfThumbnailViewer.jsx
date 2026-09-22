import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axiosClient from '../../../services/api/axiosClient';
import { FileFormatError } from '../FileFormatError';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker chargé depuis le CDN avec la version exacte de react-pdf
// Évite le conflit de version entre pdfjs-dist installé séparément et celui embarqué par react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// ────────────────────────────────────────────────────────────────
// Composant utilitaire : Skeleton pendant le chargement d'une vignette
// ────────────────────────────────────────────────────────────────
const ThumbnailSkeleton = ({ width }) => (
  <div
    className="rounded-xl bg-surface-container animate-pulse"
    style={{ width, height: width * 1.41 }}
  />
);

// ────────────────────────────────────────────────────────────────
// Composant utilitaire : Une vignette individuelle
// ────────────────────────────────────────────────────────────────
const PageThumbnail = ({
  pageNumber,
  totalPages,
  isSelected,
  selectionStyle, // 'blue' | 'red'
  thumbWidth,
  onClick,
  onDoubleClick,
  isVisible,
  onRenderSuccess, // callback appelé quand la page est rendue → incrémente renderedCount
}) => {
  const overlayClass =
    selectionStyle === 'red'
      ? 'ring-2 ring-red-500 bg-red-500/15'
      : 'ring-2 ring-primary bg-primary/10';

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => onClick(pageNumber)}
        onDoubleClick={() => onDoubleClick && onDoubleClick(pageNumber)}
        className={`relative rounded-xl overflow-hidden shadow-sm border transition-all duration-200 cursor-pointer group
          ${isSelected ? overlayClass : 'border-outline-variant hover:border-primary hover:shadow-md'}
        `}
        style={{ width: thumbWidth }}
        aria-label={`Page ${pageNumber}`}
      >
        {isVisible ? (
          <Page
            pageNumber={pageNumber}
            width={thumbWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={<ThumbnailSkeleton width={thumbWidth} />}
            onRenderSuccess={onRenderSuccess}
          />
        ) : (
          <div style={{ width: thumbWidth, height: thumbWidth * 1.41 }} className="bg-surface-container" />
        )}

        {/* Overlay de sélection */}
        {isSelected && selectionStyle === 'red' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
            <span className="material-symbols-outlined text-red-500 text-[40px] drop-shadow-lg">close</span>
          </div>
        )}
        {isSelected && selectionStyle === 'blue' && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
            <span className="material-symbols-outlined text-primary text-[28px] drop-shadow-lg">check_circle</span>
          </div>
        )}

        {/* Indicateur de début de plage (pour les modes Plage et Mixte) */}
        {isVisible && window.debutPlage === pageNumber && (
           <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 rounded shadow">Début</div>
        )}

        {/* Numéro en survol */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/90 text-on-surface text-label-xs font-label-bold px-1.5 py-0.5 rounded-md shadow">
          {pageNumber}
        </div>
      </button>

      <span className="text-label-xs text-on-surface-variant">
        Page {pageNumber} / {totalPages}
      </span>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// Toolbar du Visualiseur
// ────────────────────────────────────────────────────────────────
const ViewerToolbar = ({
  totalPages,
  selectedCount,
  thumbSize,
  onThumbSizeChange,
  onSelectAll,
  onDeselectAll,
  selectionLabel,
  modeSelection,
  setModeSelection
}) => {
  const MODES = [
    {
      id: 'plage',
      label: 'Plage',
      labelLong: 'Plage contiguë',
      description: '1er clic = début · 2e clic = fin. Toutes les pages entre les deux sont sélectionnées.',
      icone: 'linear_scale',
      fillIcon: true
    },
    {
      id: 'individuel',
      label: 'Individuel',
      labelLong: 'Pages isolées',
      description: 'Cliquez sur chaque page à sélectionner indépendamment. Idéal pour une liste non contiguë.',
      icone: 'touch_app',
      fillIcon: false
    },
    {
      id: 'mixte',
      label: 'Mixte',
      labelLong: 'Sélection mixte',
      description: 'Clic = page isolée · Double-clic = bornes de plage.',
      icone: 'rule',
      fillIcon: false
    }
  ];

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Sélecteur de mode */}
      <div className="flex flex-wrap items-center gap-2">
        {MODES.map(mode => {
          const isActive = modeSelection === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setModeSelection(mode.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all font-medium ${
                isActive
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary/40 hover:text-primary hover:bg-surface-container'
              }`}
              title={mode.labelLong}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: mode.fillIcon && isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {mode.icone}
              </span>
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>
      {/* Description du mode actif */}
      <div className="flex items-start gap-2 px-3 py-2 bg-surface-container rounded-xl">
        <span className="material-symbols-outlined text-[15px] text-primary flex-shrink-0 mt-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface mr-1">
            {MODES.find(m => m.id === modeSelection)?.labelLong} :
          </strong>
          {MODES.find(m => m.id === modeSelection)?.description}
        </p>
      </div>

      {/* Barre d'outils (compteur, boutons...) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-container rounded-2xl">
        {/* Compteur de sélection */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">checklist</span>
          <span className="text-label-md text-on-surface">
            <strong>{selectedCount}</strong> {selectionLabel || 'page(s) sélectionnée(s)'} sur <strong>{totalPages}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Boutons sélection globale */}
          <button
            onClick={selectedCount === totalPages ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1 text-label-sm text-primary hover:text-primary/80 font-label-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {selectedCount === totalPages ? 'deselect' : 'select_all'}
            </span>
            {selectedCount === totalPages ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>

          {/* Séparateur */}
          <div className="w-px h-5 bg-outline-variant" />

          {/* Slider de zoom */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">photo_size_select_small</span>
            <input
              type="range"
              min={100}
              max={250}
              step={10}
              value={thumbSize}
              onChange={(e) => onThumbSizeChange(Number(e.target.value))}
              className="w-20 accent-primary"
            />
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">photo_size_select_large</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
// Barre de progression globale du chargement
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

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : PdfThumbnailViewer
// ════════════════════════════════════════════════════════════════
/**
 * @param {string}   fileId           — UUID du fichier uploadé
 * @param {'range'|'multiple'} mode   — mode de sélection
 * @param {number[]} selection        — tableau d'indices de pages sélectionnées (1-indexed)
 * @param {Function} onSelectionChange — callback(newSelection: number[])
 * @param {'blue'|'red'} selectionStyle — couleur des pages sélectionnées
 * @param {string}   selectionLabel   — libellé personnalisé du compteur
 * @param {Function} onLoadSuccess    — callback(numPages) appelé quand le PDF est chargé
 */
export const PdfThumbnailViewer = ({
  fileId,
  motDePassePdf,
  mode = 'multiple',
  selection = [],
  onSelectionChange,
  selectionStyle = 'blue',
  selectionLabel,
  onLoadSuccess,
  onChangeFile,
  onPasswordSubmit,
}) => {
  const [numPages, setNumPages] = useState(null);
  // On conserve le MDP dans un state ET une ref pour éviter les closures stales
  const [pdfPassword, setPdfPassword] = useState(motDePassePdf || null);
  const pdfPasswordRef = React.useRef(motDePassePdf || null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [thumbSize, setThumbSize] = useState(160);
  const [renderedCount, setRenderedCount] = useState(0);
  const [debutPlage, setDebutPlage] = useState(null);
  const [modeSelection, setModeSelection] = useState('plage'); // 'plage' | 'individuel' | 'mixte'
  const timerRef = useRef(null);

  // On stocke debutPlage sur window pour qu'il soit accessible par PageThumbnail sans prop-drilling
  useEffect(() => {
    window.debutPlage = debutPlage;
    return () => { delete window.debutPlage; };
  }, [debutPlage]);

  // Si on change de mode, on réinitialise les états de plage
  const handleModeChange = useCallback((nouveauMode) => {
    setModeSelection(nouveauMode);
    setDebutPlage(null);
  }, []);

  // Données PDF chargées via axiosClient (authentifié)
  const [pdfData, setPdfData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Visibilité via Intersection Observer (virtualisation)
  const [visiblePages, setVisiblePages] = useState(new Set());
  const observerRef = useRef(null);
  const sentinelRefs = useRef({});

  // ── Chargement du PDF via axiosClient (JWT géré automatiquement) ──
  useEffect(() => {
    if (!fileId) return;
    let cancelled = false;
    setPdfLoading(true);
    setPdfData(null);
    setLoadError(null);
    setNumPages(null);

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
          setLoadError(err.response?.status === 404
            ? 'Fichier introuvable ou expiré.'
            : 'Impossible de charger le fichier.');
        }
      });

    return () => { cancelled = true; };
  }, [fileId]);

  // ── Intersection Observer pour la virtualisation ──
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisiblePages((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const pageNum = Number(entry.target.dataset.page);
            if (entry.isIntersecting) {
              next.add(pageNum);
            } else {
              next.delete(pageNum);
            }
          });
          return next;
        });
      },
      { rootMargin: '200px 0px' } // 200px buffer au-dessus et en dessous
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // ── Observer les sentinelles quand numPages change ──
  useEffect(() => {
    if (!numPages || !observerRef.current) return;
    const observer = observerRef.current;
    Object.values(sentinelRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [numPages, thumbSize]);

  // ── Handlers react-pdf ──
  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
    setNeedsPassword(false);
    setLoadError(null);
    setRenderedCount(0); // Reset à chaque nouveau document
    if (onLoadSuccess) onLoadSuccess(n);
  }, [onLoadSuccess]);

  const onDocumentLoadError = useCallback((error) => {
    const msg = error?.message || '';
    if (msg.includes('PasswordException') || error?.name === 'PasswordException') {
      setNeedsPassword(true);
    } else {
      setLoadError(
        'Ce fichier ne peut pas être prévisualisé car il n\'est pas un PDF valide.\n\n' +
        'Si votre document est au format Word, Excel ou PowerPoint, convertissez-le d\'abord en PDF via l\'outil « Office vers PDF ».' +
        '\n\nSi votre fichier est bien un PDF mais qu\'il s\'affiche pas, il est peut-être corrompu ou protégé par un mot de passe.'
      );
    }
  }, []);

  // Callback passé à chaque <Page> — incrémente renderedCount à chaque rendu réussi
  const onPageRenderSuccess = useCallback(() => {
    setRenderedCount((c) => c + 1);
  }, []);

  // ── Logique de sélection ──
  const handlePageClick = useCallback((numPage) => {
    let next;

    if (modeSelection === 'individuel') {
      next = selection.includes(numPage)
        ? selection.filter(p => p !== numPage)
        : [...selection, numPage].sort((a, b) => a - b);
      onSelectionChange(next);
      return;
    }

    if (modeSelection === 'plage') {
      if (debutPlage === null) {
        setDebutPlage(numPage);
        onSelectionChange([numPage]);
      } else {
        const debut = Math.min(debutPlage, numPage);
        const fin = Math.max(debutPlage, numPage);
        const range = [];
        for (let i = debut; i <= fin; i++) range.push(i);
        onSelectionChange(range);
        setDebutPlage(null);
      }
      return;
    }

    if (modeSelection === 'mixte') {
      // Pour différencier le simple du double-clic, on utilise un timer
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        if (debutPlage !== null) setDebutPlage(null);
        next = selection.includes(numPage)
          ? selection.filter(p => p !== numPage)
          : [...selection, numPage].sort((a, b) => a - b);
        onSelectionChange(next);
      }, 250);
      return;
    }
  }, [modeSelection, selection, debutPlage, onSelectionChange]);

  const handlePageDoubleClick = useCallback((numPage) => {
    if (modeSelection === 'mixte') {
      // Annule le simple-clic
      if (timerRef.current) clearTimeout(timerRef.current);

      if (debutPlage === null) {
        setDebutPlage(numPage);
        if (!selection.includes(numPage)) {
          onSelectionChange([...selection, numPage].sort((a, b) => a - b));
        }
      } else {
        const debut = Math.min(debutPlage, numPage);
        const fin = Math.max(debutPlage, numPage);
        const pagesPlage = [];
        for (let i = debut; i <= fin; i++) pagesPlage.push(i);
        const selectionMergee = [...new Set([...selection, ...pagesPlage])].sort((a, b) => a - b);
        onSelectionChange(selectionMergee);
        setDebutPlage(null);
      }
    }
  }, [modeSelection, selection, debutPlage, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    if (!numPages) return;
    const all = Array.from({ length: numPages }, (_, i) => i + 1);
    onSelectionChange(all);
    setDebutPlage(null);
  }, [numPages, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    onSelectionChange([]);
    setDebutPlage(null);
  }, [onSelectionChange]);

  // ── Gestion du mot de passe ──
  const handlePasswordSubmit = useCallback((pwd) => {
    pdfPasswordRef.current = pwd;
    setPdfPassword(pwd);
    setNeedsPassword(false);
    setPdfData(prev => prev ? { data: prev.data } : null); // Force react-pdf à recharger
    if (onPasswordSubmit) onPasswordSubmit(pwd);
  }, [onPasswordSubmit]);

  // ── Render ──
  if (!fileId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] mb-4">description</span>
        <p className="text-body-md">Aucun fichier sélectionné.</p>
      </div>
    );
  }

  if (needsPassword) {
    return <PasswordDialog onSubmit={handlePasswordSubmit} />;
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
    <div className="w-full">
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
        onPassword={(callback, reason) => {
          // Utiliser la ref pour avoir toujours la valeur fraiche
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
            {/* Toolbar */}
            <ViewerToolbar
              totalPages={numPages}
              selectedCount={selection.length}
              thumbSize={thumbSize}
              onThumbSizeChange={setThumbSize}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              selectionLabel={selectionLabel}
              modeSelection={modeSelection}
              setModeSelection={handleModeChange}
            />

            {/* Progression */}
            {renderedCount < numPages && (
              <LoadingProgress loaded={renderedCount} total={numPages} />
            )}


            {/* Grille de vignettes */}
            <div
              className="grid gap-4 justify-items-center"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${thumbSize}px, 1fr))`,
              }}
            >
              {Array.from({ length: numPages }, (_, i) => {
                const pageNum = i + 1;
                const isVisible = visiblePages.has(pageNum);
                return (
                  <div
                    key={pageNum}
                    ref={(el) => {
                      sentinelRefs.current[pageNum] = el;
                      if (el && observerRef.current) {
                        observerRef.current.observe(el);
                      }
                    }}
                    data-page={pageNum}
                  >
                    <PageThumbnail
                      pageNumber={pageNum}
                      totalPages={numPages}
                      isSelected={selection.includes(pageNum)}
                      selectionStyle={selectionStyle}
                      thumbWidth={thumbSize}
                      onClick={handlePageClick}
                      onDoubleClick={handlePageDoubleClick}
                      isVisible={isVisible}
                      onRenderSuccess={onPageRenderSuccess}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Document>
      )}
    </div>
  );
};
