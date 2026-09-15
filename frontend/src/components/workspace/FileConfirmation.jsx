import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { useNavigate } from 'react-router-dom';
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
const DirectActionButton = ({ tool, onStart, isProcessing, disabled }) => {
  if (!onStart) return null;

  const labels = {
    convert_to_pdf: { idle: 'Convertir en PDF', processing: 'Conversion…', icon: 'description' },
    pdf_to_txt: { idle: 'Extraire le texte', processing: 'Extraction…', icon: 'text_snippet' },
  };
  const cfg = labels[tool?.id] || { idle: 'Lancer le traitement', processing: 'En cours…', icon: 'play_arrow' };

  return (
    <button
      onClick={() => onStart({})}
      disabled={isProcessing || disabled}
      className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
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

// Carte d'erreur de format épurée
const FormatErrorCard = ({ fileName, tool, onChangeFile }) => {
  const navigate = useNavigate();

  let message = '';
  let showConvert = false;

  if (tool?.id === 'convert_to_pdf') {
    message = `"${fileName}" ne peut pas être converti. Cet outil n'accepte que les fichiers Word, Excel et PowerPoint.`;
    showConvert = false;
  } else if (tool?.id === 'convert_images_to_pdf') {
    message = `"${fileName}" n'est pas une image compatible. Formats acceptés : JPG, PNG, BMP, GIF, TIFF.`;
    showConvert = false;
  } else {
    message = `"${fileName}" ne peut pas être utilisé ici. Cet outil fonctionne uniquement avec des fichiers PDF.`;
    showConvert = true;
  }

  return (
    <div className="p-4 bg-error/10 border border-error/30 rounded-xl space-y-3">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[18px] text-error mt-0.5 shrink-0">error</span>
        <p className="text-body-sm text-error">{message}</p>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onChangeFile}
          className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-error/30 text-error rounded-lg text-label-sm font-label-bold hover:bg-error/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          Changer de fichier
        </button>
        {showConvert && (
          <button
            onClick={() => navigate('/dashboard/tools/convert_to_pdf')}
            className="flex items-center gap-1.5 px-4 py-2 bg-error text-on-error rounded-lg text-label-sm font-label-bold hover:bg-error/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">autorenew</span>
            Convertir en PDF
          </button>
        )}
      </div>
    </div>
  );
};

export const FileConfirmation = ({ file, tool, onChangeFile, startError, onStart, isProcessing }) => {
  const [nbPages, setNbPages] = useState(null);

  if (!file) return null;

  const fileName = file.nomOriginal || file.name || 'document.pdf';
  const fileIcon = getFileIcon(fileName);
  const fileExt = '.' + fileName.split('.').pop().toLowerCase();
  const isPdf = fileExt === '.pdf';

  // Validation du format par rapport à l'outil sélectionné
  const hasFormatError = tool?.typesAcceptes
    ? !tool.typesAcceptes.extensions.includes(fileExt)
    : (!isPdf && !['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.zip', '.txt'].includes(fileExt));

  // Charger le nombre de pages pour les fichiers PDF valides
  useEffect(() => {
    if (!isPdf || !file.fileId || hasFormatError) return;
    let cancelled = false;

    axiosClient.get(`/files/download/${file.fileId}`, { responseType: 'arraybuffer' })
      .then((response) => {
        if (cancelled) return;
        return pdfjs.getDocument({ data: response.data }).promise;
      })
      .then((pdfDoc) => {
        if (!cancelled && pdfDoc) setNbPages(pdfDoc.numPages);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [file.fileId, isPdf, hasFormatError]);

  // Construire la ligne de métadonnées
  const metaParts = [];
  if (isPdf && nbPages != null) metaParts.push(`${nbPages} page${nbPages > 1 ? 's' : ''}`);
  if (file.tailleOctets) metaParts.push(formatSize(file.tailleOctets));

  return (
    <div className="space-y-4">

      {/* Carte du fichier sélectionné */}
      <div className={`bg-surface border-2 rounded-2xl p-5 flex items-center gap-4 shadow-sm ${hasFormatError ? 'border-error/30' : 'border-secondary/30'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${hasFormatError ? 'bg-error/10' : 'bg-secondary-container'}`}>
          <span
            className={`material-symbols-outlined text-[24px] ${hasFormatError ? 'text-error' : 'text-on-secondary-container'}`}
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
          {hasFormatError ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-error/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-error" />
              <span className="text-label-sm text-error font-label-bold">Format invalide</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-label-sm text-green-600 font-label-bold">Prêt</span>
            </div>
          )}
        </div>
      </div>

      {/* Carte d'erreur de format (remplace le message "configurer à droite") */}
      {hasFormatError && (
        <FormatErrorCard fileName={fileName} tool={tool} onChangeFile={onChangeFile} />
      )}

      {/* Message d'info "configurer à droite" : uniquement si pas d'erreur de format ET pas d'action directe */}
      {!hasFormatError && !onStart && (
        <div className="flex items-start gap-3 p-4 bg-surface-container rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">info</span>
          <p className="text-body-sm text-on-surface-variant">
            Configurez les options dans le panneau de droite puis cliquez sur le bouton de lancement.
            Sur mobile, utilisez le bouton flottant en bas de l'écran.
          </p>
        </div>
      )}

      {/* Erreur de lancement (provenant du serveur) */}
      {startError && !hasFormatError && (
        <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/30 rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-error mt-0.5">error</span>
          <p className="text-body-sm text-error whitespace-pre-wrap">{startError}</p>
        </div>
      )}

      {/* Bouton d'action directe (outils sans options) — caché si format invalide */}
      {!hasFormatError && (
        <DirectActionButton tool={tool} onStart={onStart} isProcessing={isProcessing} disabled={false} />
      )}

      {/* Bouton changer de fichier — affiché UNIQUEMENT si pas d'erreur de format (sinon il est dans la carte d'erreur) */}
      {!hasFormatError && (
        <button
          onClick={onChangeFile}
          className="flex items-center gap-2 text-label-sm text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          Changer de fichier
        </button>
      )}
    </div>
  );
};
