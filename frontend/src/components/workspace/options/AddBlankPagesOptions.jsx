import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import axiosClient from '../../../services/api/axiosClient';

/**
 * Hook interne : charge silencieusement le PDF en arrière-plan
 * via axiosClient (JWT géré) et retourne le nombre de pages.
 * Aucun visuel affiché — uniquement pour la validation du champ "après la page n°".
 */
const usePdfPageCount = (fichierCharge) => {
  const [pageCount, setPageCount] = useState(null);

  useEffect(() => {
    const fileId = fichierCharge?.fileId;
    if (!fileId) return;

    let cancelled = false;

    axiosClient
      .get(`/files/download/${fileId}`, { responseType: 'arraybuffer' })
      .then((res) => {
        if (cancelled) return;
        return pdfjs.getDocument({ data: res.data }).promise;
      })
      .then((pdf) => {
        if (pdf && !cancelled) setPageCount(pdf.numPages);
      })
      .catch(() => {
        // Silencieux : si la récupération échoue, la validation reste permissive
      });

    return () => { cancelled = true; };
  }, [fichierCharge?.fileId]);

  return pageCount;
};

/**
 * AddBlankPagesOptions — Formulaire simple (sans visualiseur)
 * Permet d'insérer des pages vierges à un endroit précis du PDF.
 * Le nombre de pages est récupéré silencieusement en arrière-plan
 * pour valider le champ "Après la page n°" sans afficher de miniatures.
 */
export const AddBlankPagesOptions = ({ onStart, isProcessing, fichierCharge }) => {
  const [position, setPosition] = useState('end'); // 'start' | 'end' | 'after'
  const [afterPage, setAfterPage] = useState(1);
  const [afterPageError, setAfterPageError] = useState('');
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState('A4'); // 'A4' | 'Letter'

  // Nombre réel de pages du PDF, chargé silencieusement
  const totalPages = usePdfPageCount(fichierCharge);

  const isAfterPageValid = position !== 'after' || (
    !isNaN(parseInt(afterPage, 10)) &&
    parseInt(afterPage, 10) >= 1 &&
    (!totalPages || parseInt(afterPage, 10) <= totalPages)
  );

  const handleLaunch = () => {
    let posBackend;
    if (position === 'start') posBackend = 'debut';
    else if (position === 'end') posBackend = 'fin';
    else if (position === 'after') {
      const p = parseInt(afterPage, 10);
      if (!isAfterPageValid) return; // garde double
      setAfterPageError('');
      posBackend = p;
    }

    const options = {
      position: posBackend,
      nombre: count,
      format: format.toLowerCase(), // backend attend 'a4', 'a3', etc.
    };

    onStart(options);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="font-display-xl text-title-md text-on-surface mb-1">Ajouter des pages vierges</h3>
          <p className="text-body-sm text-on-surface-variant">
            Insérez une ou plusieurs pages blanches dans votre document PDF.
          </p>
          {/* Indicateur de chargement silencieux du nombre de pages */}
          {!totalPages && fichierCharge && (
            <p className="text-label-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>
              Lecture du document…
            </p>
          )}
          {totalPages && (
            <p className="text-label-xs text-secondary mt-1">
              Document : {totalPages} page{totalPages > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Position d'insertion */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Position d'insertion</p>

          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              position === 'start' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            <input type="radio" name="pos" checked={position === 'start'} onChange={() => setPosition('start')} className="accent-primary" />
            <div>
              <p className="text-label-md font-label-bold text-on-surface">Au début du document</p>
            </div>
          </label>

          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              position === 'end' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            <input type="radio" name="pos" checked={position === 'end'} onChange={() => setPosition('end')} className="accent-primary" />
            <div>
              <p className="text-label-md font-label-bold text-on-surface">À la fin du document</p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              position === 'after' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            <input type="radio" name="pos" checked={position === 'after'} onChange={() => setPosition('after')} className="mt-1 accent-primary" />
            <div className="flex-1 space-y-2">
              <p className="text-label-md font-label-bold text-on-surface">Après la page n°</p>
              {position === 'after' && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={totalPages || 9999}
                      value={afterPage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAfterPage(val);
                        const p = parseInt(val, 10);
                        if (isNaN(p) || p < 1) {
                          setAfterPageError('Le numéro de page doit être supérieur à 0.');
                        } else if (totalPages && p > totalPages) {
                          setAfterPageError(`Ce document a ${totalPages} page${totalPages > 1 ? 's' : ''}. Entrez un numéro entre 1 et ${totalPages}.`);
                        } else {
                          setAfterPageError('');
                        }
                      }}
                      onBlur={(e) => {
                        // Clamp au blur : rattrape les flèches du spinner natif
                        let p = parseInt(e.target.value, 10);
                        if (isNaN(p) || p < 1) p = 1;
                        if (totalPages && p > totalPages) p = totalPages;
                        setAfterPage(p);
                        setAfterPageError('');
                      }}
                      className={`w-24 px-3 py-2 border rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 text-center ${
                        afterPageError
                          ? 'border-error focus:ring-error/20'
                          : 'border-outline-variant focus:ring-primary'
                      }`}
                    />
                    {totalPages && (
                      <span className="text-label-xs text-on-surface-variant">sur {totalPages}</span>
                    )}
                  </div>
                  {afterPageError && (
                    <span className="text-error text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {afterPageError}
                    </span>
                  )}
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Nombre de pages */}
        <div className="space-y-2">
          <p className="text-label-md font-label-bold text-on-surface">Nombre de pages à insérer</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="w-10 h-10 rounded-xl border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-16 px-3 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface text-center focus:outline-none focus:ring-2 focus:ring-primary font-label-bold"
            />
            <button
              onClick={() => setCount((c) => Math.min(50, c + 1))}
              className="w-10 h-10 rounded-xl border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>

        {/* Format */}
        <div className="space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Format de page</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'A4', label: 'A4', sub: '210 × 297 mm' },
              { value: 'Letter', label: 'Letter', sub: '216 × 279 mm' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                  format === f.value
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50'
                }`}
              >
                <span className="text-label-md font-label-bold text-on-surface">{f.label}</span>
                <span className="text-label-xs text-on-surface-variant">{f.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton d'action */}
      <div className="p-6 border-t border-outline-variant">
        <button
          onClick={handleLaunch}
          disabled={isProcessing || !isAfterPageValid}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Insertion en cours…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">post_add</span>
              Insérer {count} page{count > 1 ? 's' : ''} vierge{count > 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
