import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import axiosClient from '../../services/api/axiosClient';
import { formatSize } from '../../utils/formatters';

// S'assurer que le worker pdfjs est configuré
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

const FILE_ICONS = {
  'application/pdf': 'picture_as_pdf',
  'pdf': 'picture_as_pdf',
  'doc': 'description',
  'docx': 'description',
  'xls': 'table_chart',
  'xlsx': 'table_chart',
  'ppt': 'slideshow',
  'pptx': 'slideshow',
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'zip': 'folder_zip',
  'txt': 'text_snippet',
};

const getFileIcon = (filename) => {
  if (!filename) return 'insert_drive_file';
  const ext = filename.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || 'insert_drive_file';
};

// Bouton d'action inline adapté à l'outil (pour les outils sans options)
const DirectActionButton = ({ tool, onStart, isProcessing }) => {
  if (!onStart) return null;

  const labels = {
    convert_to_pdf: { idle: 'Convertir en PDF', processing: 'Conversion…', icon: 'description' },
    pdf_to_txt: { idle: 'Extraire le texte', processing: 'Extraction…', icon: 'text_snippet' },
  };
  const cfg = labels[tool?.id] || { idle: 'Lancer le traitement', processing: 'En cours…', icon: 'play_arrow' };

  return (
    <button
      onClick={() => onStart({})}
      disabled={isProcessing}
      className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
    >
      {isProcessing ? (
        <>
          <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          {cfg.processing}
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[20px]">{cfg.icon}</span>
          {cfg.idle}
        </>
      )}
    </button>
  );
};

export const FileConfirmation = ({ file, tool, onChangeFile, startError, onStart, isProcessing }) => {
  const [nbPages, setNbPages] = useState(null);

  if (!file) return null;

  const fileName = file.nomOriginal || file.name || 'document.pdf';
  const fileIcon = getFileIcon(fileName);
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  // Charger le nombre de pages pour les fichiers PDF
  useEffect(() => {
    if (!isPdf || !file.fileId) return;
    let cancelled = false;

    axiosClient.get(`/files/download/${file.fileId}`, { responseType: 'arraybuffer' })
      .then((response) => {
        if (cancelled) return;
        return pdfjs.getDocument({ data: response.data }).promise;
      })
      .then((pdfDoc) => {
        if (!cancelled && pdfDoc) {
          setNbPages(pdfDoc.numPages);
        }
      })
      .catch(() => {
        // Silencieux — le nombre de pages est une info bonus
      });

    return () => { cancelled = true; };
  }, [file.fileId, isPdf]);

  // Construire la ligne de métadonnées
  const metaParts = [];
  if (isPdf && nbPages != null) {
    metaParts.push(`${nbPages} page${nbPages > 1 ? 's' : ''}`);
  }
  if (file.tailleOctets) {
    metaParts.push(formatSize(file.tailleOctets));
  }

  return (
    <div className="space-y-6">
      {/* En-tête de l'outil */}
      {tool && (
        <div>
          <h1 className="font-display-xl text-headline-md text-on-surface mb-1">{tool.nom}</h1>
          <p className="text-body-md text-on-surface-variant">{tool.description}</p>
        </div>
      )}

      {/* Carte du fichier sélectionné */}
      <div className="bg-surface border-2 border-secondary/30 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
        <div className="w-14 h-14 rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-[28px] text-on-secondary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {fileIcon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-bold text-label-lg text-on-surface truncate">{fileName}</p>
          {metaParts.length > 0 && (
            <p className="text-body-sm text-on-surface-variant mt-0.5">{metaParts.join(' · ')}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-label-sm text-green-600 font-label-bold">Prêt</span>
          </div>
        </div>
      </div>

      {/* Message d'info uniquement pour les outils avec un panneau de config */}
      {!onStart && (
        <div className="flex items-start gap-3 p-4 bg-surface-container rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">info</span>
          <p className="text-body-sm text-on-surface-variant">
            Configurez les options dans le panneau de droite puis cliquez sur le bouton de lancement.
            Sur mobile, utilisez le bouton flottant en bas de l'écran.
          </p>
        </div>
      )}

      {/* Erreur de lancement */}
      {startError && (
        <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/30 rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-error mt-0.5">error</span>
          <p className="text-body-sm text-error">{startError}</p>
        </div>
      )}

      {/* Bouton d'action directe (outils sans options) */}
      <DirectActionButton tool={tool} onStart={onStart} isProcessing={isProcessing} />

      {/* Bouton changer de fichier */}
      <button
        onClick={onChangeFile}
        className="flex items-center gap-2 text-label-sm text-on-surface-variant hover:text-error transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
        Changer de fichier
      </button>
    </div>
  );
};

