import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatSize } from '../../utils/formatters';
import axiosClient from '../../services/api/axiosClient';

// Correspondance extension ↔ icône/libellé
const getFileInfo = (contentDisposition, fallbackUrl) => {
  // Essai sur le Content-Disposition d'abord, sinon sur l'URL
  let filename = '';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename\*=UTF-8''(.+)|filename="?([^"]+)"?/i);
    if (match) filename = decodeURIComponent(match[1] || match[2] || '');
  }
  if (!filename && fallbackUrl) {
    filename = fallbackUrl.split('/').pop();
    try { filename = decodeURIComponent(filename); } catch(e) {}
  }

  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const iconMap = {
    pdf: { icon: 'picture_as_pdf', label: 'Télécharger le PDF' },
    zip: { icon: 'folder_zip', label: "Télécharger l'archive ZIP" },
    txt: { icon: 'text_snippet', label: 'Télécharger le texte (.txt)' },
    png: { icon: 'image', label: "Télécharger l'image PNG" },
    jpg: { icon: 'image', label: "Télécharger l'image JPG" },
    jpeg: { icon: 'image', label: "Télécharger l'image" },
  };
  return { ...(iconMap[ext] || { icon: 'download', label: 'Télécharger le fichier' }), filename };
};

export const ResultCard = ({ tool, result, originalFile, onNewFile }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Récupération de la valeur brute de l'URL (chemin relatif, ex: /api/files/download/uuid)
  const rawUrl = result?.resultat_url || result?.data?.resultat_url;
  const tailleResult = result?.taille_result || result?.data?.taille_result;
  // Calcul de la réduction si applicable (compression uniquement)
  let reductionPercent = result?.reduction_percent || result?.data?.reduction_percent;
  if (reductionPercent == null && tool.id === 'compress' && originalFile?.tailleOctets && tailleResult) {
    const ratio = ((originalFile.tailleOctets - tailleResult) / originalFile.tailleOctets) * 100;
    reductionPercent = Math.max(0, Math.round(ratio));
  }
  // Affichage avant/après uniquement pour la compression
  const showCompressionStats = tool.id === 'compress' && (reductionPercent != null || (originalFile?.tailleOctets && tailleResult));

  // Message naturel et informatif généré dynamiquement
  const getDynamicSuccessMessage = () => {
    let baseMessage = 'Le traitement de votre fichier est terminé avec succès.';
    
    if (tool.id === 'compress') {
      if (reductionPercent > 0 && originalFile?.tailleOctets && tailleResult) {
        return `Excellente nouvelle ! Votre fichier a été allégé de ${reductionPercent}%. Sa taille est passée de ${formatSize(originalFile.tailleOctets)} à ${formatSize(tailleResult)}.`;
      } else if (tailleResult) {
        return `Votre fichier a été compressé avec succès. Sa nouvelle taille est de ${formatSize(tailleResult)}.`;
      } else {
        return 'Votre fichier a été compressé avec succès !';
      }
    }
    
    if (tool.id === 'protect') {
      return 'Sécurité renforcée ! Votre document est désormais chiffré et protégé par mot de passe.';
    }
    
    if (tool.id === 'unprotect') {
      return 'Liberté retrouvée ! La protection par mot de passe a été retirée de votre document.';
    }
    
    if (tool.id === 'convert_to_pdf') {
      return 'Conversion réussie ! Votre document Office est maintenant un PDF parfait.';
    }
    
    if (tool.id === 'pdf_to_txt') {
      return 'Extraction terminée ! Tout le texte de votre PDF a été récupéré dans un fichier brut.';
    }
    
    if (tool.id === 'merge') {
      return 'Fusion réussie ! Votre nouveau document PDF consolidé est prêt.';
    }
    
    if (tool.id === 'convert_images_to_pdf') {
      return 'Conversion réussie ! Vos images ont été transformées en un PDF unique.';
    }

    if (tool.id === 'split') {
      return 'Découpage réussi ! Vos pages ont été extraites avec succès.';
    }

    if (tool.id === 'remove_pages') {
      return 'Nettoyage terminé ! Les pages indésirables ont été supprimées de votre document.';
    }

    if (tool.id === 'rotate') {
      return 'Rotation effectuée ! Les pages de votre document ont été réorientées.';
    }

    if (tool.id === 'add_blank_pages') {
      return 'Insertion réussie ! Les pages vierges ont été ajoutées à votre document.';
    }

    if (tool.id === 'pdf_to_images') {
      return 'Conversion terminée ! Vos pages PDF ont été exportées en images.';
    }

    if (tool.id === 'extract_images') {
      return 'Extraction réussie ! Les images contenues dans votre PDF ont été récupérées.';
    }
    
    // Fallback pour les autres outils (split, watermark, etc.)
    return 'Opération réussie !';
  };


  // Téléchargement sécurisé via axiosClient (Bearer token injecté automatiquement)
  const handleDownload = async () => {
    if (!rawUrl) return;
    setDownloading(true);
    setDownloadError(null);

    try {
      // axiosClient sait déjà pointer sur http://localhost:5001/api,
      // on retire le préfixe /api/ puisque baseURL inclut déjà /api
      const endpoint = rawUrl.replace(/^\/api/, '');
      const response = await axiosClient.get(endpoint, { responseType: 'blob' });

      // Récupération du nom de fichier depuis le header
      const disposition = response.headers['content-disposition'] || '';
      const { filename } = getFileInfo(disposition, rawUrl);
      const downloadName = filename || 'document_traite';

      // Création d'un lien temporaire en mémoire → déclenchement du téléchargement
      const blobUrl = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Nettoyage mémoire (délai pour laisser le browser démarrer le téléchargement)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      setDownloadError('Impossible de télécharger le fichier. Le lien a peut-être expiré.');
    } finally {
      setDownloading(false);
    }
  };

  // Déduit l'icône/libellé depuis le rawUrl à défaut d'un Content-Disposition
  const { icon: dlIcon, label: dlLabel } = getFileInfo('', rawUrl || '');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-8 animate-scale visible">

      {/* Checkmark */}
      <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
        <span
          className="material-symbols-outlined text-[52px] text-green-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
      </div>

      {/* Informations */}
      <div className="space-y-4 max-w-md w-full">
        <h2 className="font-display-xl text-headline-md text-on-surface">
          {getDynamicSuccessMessage()}
        </h2>

        {/* Statistiques de compression */}
        {showCompressionStats && (
          <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-surface-container rounded-2xl">
            {originalFile?.tailleOctets && (
              <div className="text-center">
                <p className="text-label-xs text-on-surface-variant uppercase tracking-wide">Avant</p>
                <p className="text-body-md font-label-bold text-on-surface line-through opacity-60">
                  {formatSize(originalFile.tailleOctets)}
                </p>
              </div>
            )}
            <span className="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
            {tailleResult && (
              <div className="text-center">
                <p className="text-label-xs text-on-surface-variant uppercase tracking-wide">Après</p>
                <p className="text-body-md font-label-bold text-on-surface">
                  {formatSize(tailleResult)}
                </p>
              </div>
            )}
            {reductionPercent != null && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/15 text-green-600 rounded-full text-label-md font-label-bold ml-1">
                <span className="material-symbols-outlined text-[16px]">trending_down</span>
                -{reductionPercent}%
              </span>
            )}
          </div>
        )}


      </div>

      {/* Erreur de téléchargement */}
      {downloadError && (
        <div className="flex items-start gap-2 p-4 bg-error/10 border border-error/30 rounded-xl max-w-sm w-full">
          <span className="material-symbols-outlined text-[18px] text-error mt-0.5">error</span>
          <p className="text-body-sm text-error text-left">{downloadError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col w-full max-w-sm gap-3">
        {rawUrl ? (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 hover:shadow-lg transition-all disabled:opacity-70"
          >
            {downloading ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                Préparation du téléchargement…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">{dlIcon}</span>
                {dlLabel}
              </>
            )}
          </button>
        ) : (
          <div className="px-6 py-4 bg-surface-container rounded-2xl text-on-surface-variant text-body-sm">
            Le lien de téléchargement sera disponible dans votre historique de jobs.
          </div>
        )}

        <button
          onClick={onNewFile}
          className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface rounded-2xl font-label-bold transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Traiter un autre fichier
        </button>

        <Link
          to="/dashboard"
          className="text-label-md text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
        >
          Retour à l'atelier
        </Link>
      </div>
    </div>
  );
};
