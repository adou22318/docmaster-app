import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../services/api/axiosClient';
import { useNotificationStore } from '../../store/useNotificationStore';
import { getSuccessMessage, getEchecTitre } from '../../utils/operationMessages';

const MESSAGES_ERREUR = {
  // Fichiers
  FICHIER_INTROUVABLE: "Le fichier source n'est plus disponible. Veuillez le ré-importer et réessayer.",
  FICHIER_RESULTAT_MANQUANT: "Le traitement a échoué : le fichier résultat est introuvable. Réessayez ou contactez le support.",
  // Compression
  COMPRESSION_ECHOUEE: "La compression a échoué. Si votre PDF est protégé par un mot de passe, retirez d'abord la protection via l'outil \u00ab Retirer protection \u00bb.",
  COMPRESSION_INEFFICACE: "La compression n'a pas réduit la taille du fichier (le PDF est déjà optimisé ou de haute qualité). Votre fichier original vous est retourné.",
  // Mots de passe
  MOT_DE_PASSE_INCORRECT: 'Le mot de passe saisi est incorrect pour déverrouiller le fichier. Vérifiez-le et réessayez.',
  MOT_DE_PASSE_TROP_COURT: 'Le mot de passe fourni est trop court (4 caractères minimum requis).',
  PDF_CHIFFRE: "Ce PDF est protégé par un mot de passe. Retirez d'abord la protection avec l'outil \u00ab Retirer protection \u00bb, puis réessayez.",
  PROTECTION_ECHOUEE: "La protection par mot de passe a échoué. Assurez-vous que le PDF n'est pas déjà protégé.",
  // Sélection de pages
  PLAGE_INVALIDE: 'La sélection de pages est invalide. Vérifiez que les numéros de pages existent dans votre document.',
  SELECTION_INVALIDE: 'La sélection de pages est invalide. Vérifiez que les numéros saisis correspondent à des pages existantes.',
  SELECTION_VIDE: 'Aucune page sélectionnée. Sélectionnez au moins une page avant de lancer le traitement.',
  AUCUNE_PAGE_SELECTIONNEE: 'Aucune page valide dans la sélection. Vérifiez les numéros de pages saisis.',
  TOUTES_LES_PAGES_SUPPRIMEES: 'Vous ne pouvez pas supprimer toutes les pages. Un PDF doit conserver au moins une page.',
  AUCUNE_PAGE_FUSIONNEE: 'Aucune page n\'a pu être fusionnée. Vérifiez que vos fichiers PDF ne sont pas corrompus.',
  // Opérations de texte et images
  TYPE_OPERATION_INCONNU: 'Opération non reconnue. Veuillez recharger la page et réessayer.',
  AUCUNE_IMAGE_EMBARQUEE_TROUVEE: 'Aucune image embarquée n\'a été trouvée dans les pages sélectionnées. Essayez d\'autres pages ou vérifiez que votre PDF contient bien des images incorporées.',
  ECHEC_EXTRACTION_IMAGES: 'L\'extraction des images a échoué. Assurez-vous que votre PDF n\'est pas protégé ou corrompu.',
  INTEGRATION_IMAGE_ECHOUEE: 'L\'intégration de l\'image a échoué. Vérifiez le format de l\'image (PNG ou JPG uniquement).',
  AUCUN_TEXTE_EXTRAIT: 'Aucun texte n\'a pu être extrait de ce PDF. Il s\'agit peut-être d\'un PDF scanné (image). L\'extraction de texte ne fonctionne que sur les PDF avec du texte numérique.',
  AUCUNE_IMAGE_GENEREE: 'Aucune image n\'a pu être générée. Vérifiez que le PDF n\'est pas protégé ou corrompu.',
  // Signature
  FICHIER_PDF_INTROUVABLE: "Le fichier PDF source est introuvable. Veuillez le ré-importer et réessayer.",
  FICHIER_SIGNATURE_INTROUVABLE: "La signature n'a pas pu être retrouvée sur le serveur. Veuillez recréer votre signature et réessayer.",
  FORMAT_SIGNATURE_NON_SUPPORTE: "Le format de la signature n'est pas pris en charge. Utilisez PNG, JPG ou dessinez votre signature directement.",
  // Paiement / Abonnement
  ESSAI_EXPIRE: "Votre période d'essai de 7 jours est terminée. Rendez-vous sur la page Tarifs pour choisir un plan.",
  ABONNEMENT_EXPIRE: "Votre abonnement Pro a expiré. Renouvelez-le sur la page Tarifs pour continuer.",
  ABONNEMENT_REQUIS: "Cette fonctionnalité nécessite un abonnement actif. Consultez la page Tarifs.",
  ABONNEMENT_DEJA_ACTIF: "Vous avez déjà un abonnement Pro actif.",
  PAYDUNYA_ERREUR: "Une erreur est survenue lors de l'initiation du paiement. Réessayez dans quelques instants.",
  // Réorganisation de pages
  ORDRE_IDENTIQUE: "L'ordre des pages n'a pas été modifié. Déplacez au moins une page dans le visualiseur avant de valider.",
  ORDRE_INVALIDE: "L'ordre de pages transmis est invalide. Veuillez réessayer en vérifiant votre sélection.",
};

// Parseur pour les erreurs avec payload dynamique
// Ces erreurs ont le format CODE:valeur et nécessitent un message contextuel
const parseRawError = (raw) => {
  if (!raw) return null;

  // POSITION_INVALIDE:N — position hors bornes dans add_blank_pages
  const posMatch = raw.match(/^POSITION_INVALIDE:(\d+)$/);
  if (posMatch) {
    return `La position n° ${posMatch[1]} est invalide pour ce document. Vérifiez que le numéro de page que vous avez saisi ne dépasse pas le nombre total de pages du PDF, puis réessayez.`;
  }

  // PAGE_INVALIDE:N — page hors bornes dans rotate/remove_pages
  const pageInvalideMatch = raw.match(/^PAGE_INVALIDE:(\d+)$/);
  if (pageInvalideMatch) {
    return `La page n° ${pageInvalideMatch[1]} n'existe pas dans ce document. Vérifiez votre sélection dans le visualiseur.`;
  }

  // PAGE_HORS_BORNES:N,total=X — parsePages.js
  const horsbornesMatch = raw.match(/^PAGE_HORS_BORNES:(\d+)(?:,total=(\d+))?$/);
  if (horsbornesMatch) {
    const page = horsbornesMatch[1];
    const total = horsbornesMatch[2];
    return total
      ? `La page n° ${page} dépasse le nombre de pages du document (${total} pages). Vérifiez votre sélection.`
      : `La page n° ${page} n'existe pas dans ce document. Vérifiez votre sélection.`;
  }

  // PLAGE_INVERSEE:segment — parsePages.js
  const plageInverseeMatch = raw.match(/^PLAGE_INVERSEE:(.+)$/);
  if (plageInverseeMatch) {
    return `La plage "${plageInverseeMatch[1]}" est inversée (début > fin). Utilisez le format "début-fin", ex: 1-5.`;
  }

  // SYNTAXE_INVALIDE:segment — parsePages.js
  const syntaxeMatch = raw.match(/^SYNTAXE_INVALIDE:(.+)$/);
  if (syntaxeMatch) {
    return `La syntaxe "${syntaxeMatch[1]}" est incorrecte. Utilisez le format "1-3, 7, 12-15".`;
  }

  // ECHEC_EXTRACTION_TEXTE:msg — pdfToTxt.js
  if (raw.startsWith('ECHEC_EXTRACTION_TEXTE:')) {
    return "L'extraction du texte a échoué. Assurez-vous que le PDF n'est pas protégé ou corrompu.";
  }

  // ECHEC_RASTERISATION:page=N — rasterize.js
  const rasterMatch = raw.match(/^ECHEC_RASTERISATION:page=(\d+)$/);
  if (rasterMatch) {
    return `La conversion de la page ${rasterMatch[1]} en image a échoué. Vérifiez que le PDF n'est pas corrompu ou protégé.`;
  }

  // ECHEC_ARCHIVAGE:msg — rasterize.js
  if (raw.startsWith('ECHEC_ARCHIVAGE:')) {
    return "La création de l'archive ZIP a échoué. Réessayez ou contactez le support.";
  }

  // INTEGRATION_SIGNATURE_ECHOUEE:msg — sign.js
  if (raw.startsWith('INTEGRATION_SIGNATURE_ECHOUEE:')) {
    return "L'apposition de la signature sur le PDF a échoué. Vérifiez que le PDF n'est pas protégé et réessayez.";
  }

  // PROTECTION_ECHOUEE:msg — protect.js
  if (raw.startsWith('PROTECTION_ECHOUEE:')) {
    return "La protection par mot de passe a échoué. Assurez-vous que le PDF n'est pas déjà protégé ou corrompu.";
  }

  // FORMAT_INVALIDE:X — addBlankPages.js
  if (raw.startsWith('FORMAT_INVALIDE:')) {
    return "Le format de page spécifié n'est pas pris en charge. Choisissez A4 ou Letter.";
  }

  return null;
};


const getProgressMessage = (pct) => {
  if (pct < 20) return 'Préparation du traitement…';
  if (pct < 60) return 'Traitement en cours…';
  if (pct < 90) return 'Finalisation…';
  return 'Presque terminé…';
};

export const JobTracker = ({ tool, jobId, onComplete, onError }) => {
  // tool = tool.id (identifiant backend, ex: 'merge', 'compress', 'pdf_to_txt'…)
  const [progression, setProgression] = useState(0);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Utiliser des refs pour les callbacks afin d'éviter les re-runs du polling
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const ajouterNotification = useNotificationStore((s) => s.ajouterNotification);

  // Connexion réseau
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  // Polling — se déclenche uniquement quand jobId est défini
  useEffect(() => {
    if (!jobId) return;

    let active = true;

    const poll = async () => {
      if (!active || isOffline) return;
      try {
        const res = await axiosClient.get(`/jobs/${jobId}`);
        const job = res.data?.data;
        if (!job || !active) return;

        setProgression(job.progression ?? 0);

        if (job.statut === 'done') {
          active = false;

          // Cas spécial : avertissement informatif stocké dans erreur_message
          // (ex: COMPRESSION_INEFFICACE — le job a réussi mais sans effet réel)
          if (job.erreur_message === 'COMPRESSION_INEFFICACE') {
            ajouterNotification({
              type: 'warning',
              titre: 'PDF déjà optimisé',
              message: 'Votre PDF est déjà bien compressé — Ghostscript n\'a pas pu réduire davantage la taille. Votre fichier original vous est retourné tel quel.',
              jobId: jobId,
              resultatUrl: job.resultat_url ? `/files/download/${job.resultat_url.split('/').pop()}` : null,
            });
          } else {
            const { titre, message } = getSuccessMessage(tool);
            ajouterNotification({
              type: 'success',
              titre,
              message,
              jobId: jobId,
              resultatUrl: job.resultat_url ? `/files/download/${job.resultat_url.split('/').pop()}` : null,
            });
          }
          onCompleteRef.current(job);
        } else if (job.statut === 'error') {
          active = false;
          const raw = job.erreur_message || '';
          // 1. Erreurs avec payload dynamique (ex: POSITION_INVALIDE:229)
          const parsedMsg = parseRawError(raw);
          // 2. Erreurs avec code fixe
          const codeMatch = Object.keys(MESSAGES_ERREUR).find(code => raw.startsWith(code));
          const msgFinal = parsedMsg
            || (codeMatch ? MESSAGES_ERREUR[codeMatch] : null)
            || raw
            || 'Une erreur inattendue est survenue. Veuillez réessayer dans quelques instants.';
          ajouterNotification({
            type: 'error',
            titre: getEchecTitre(tool),
            message: msgFinal,
            jobId: jobId,
          });
          setError(msgFinal);
          onErrorRef.current(msgFinal);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          active = false;
          setError('Job introuvable.');
        }
        // Autres erreurs réseau : on continue
      }
    };

    poll(); // Appel immédiat
    const intervalId = setInterval(poll, 2000);

    // Timeout 5 min
    const timeoutId = setTimeout(() => {
      if (active) {
        active = false;
        setError('Le traitement prend plus de temps que prévu. Retrouvez votre fichier dans l\'historique de vos jobs une fois terminé.');
      }
    }, 5 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [jobId, isOffline]);

  // ── État d'erreur ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-scale visible w-96">
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error">
          <span className="material-symbols-outlined text-[40px]">error</span>
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="font-display-xl text-title-lg text-on-surface">Erreur de traitement</h2>
          <p className="text-body-md text-on-surface-variant whitespace-pre-wrap break-words">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onErrorRef.current()}
            className="px-6 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-bold hover:bg-secondary hover:text-on-secondary transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Modifier les paramètres
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── Perte de connexion ─────────────────────────────────────────────
  const offlineBanner = isOffline && (
    <div className="flex items-center gap-3 px-4 py-3 bg-warning-container rounded-xl border border-warning mb-6">
      <span className="material-symbols-outlined text-warning text-[20px]">wifi_off</span>
      <p className="text-body-sm text-on-warning-container">
        Connexion interrompue. Le traitement continue sur le serveur. Reprise automatique dès le retour du réseau.
      </p>
    </div>
  );

  // ── Progression ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-8">
      {offlineBanner}

      {/* Icône animée */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-secondary-container/60 animate-ping" />
        <div className="relative w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[40px] text-primary"
            style={{ animation: 'spin 3s linear infinite' }}
          >
            {tool.icone}
          </span>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        <h2 className="font-display-xl text-headline-sm text-on-surface">
          {getProgressMessage(progression)}
        </h2>

        {/* Barre de progression */}
        <div className="relative w-full bg-surface-container rounded-full h-3 overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progression, 5)}%` }}
          />
        </div>
        <p className="text-label-lg font-label-bold text-primary">{progression}%</p>
      </div>

      <p className="text-body-sm text-on-surface-variant max-w-xs">
        Vous pouvez naviguer librement — le traitement continue en arrière-plan.
      </p>
    </div>
  );
};
