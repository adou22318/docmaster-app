import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../services/api/axiosClient';
import { useNotificationStore } from '../../store/useNotificationStore';
import { getSuccessMessage, getEchecTitre } from '../../utils/operationMessages';

const MESSAGES_ERREUR = {
  FICHIER_INTROUVABLE: "Le fichier source n'est plus disponible. Veuillez le ré-importer et réessayer.",
  COMPRESSION_ECHOUEE: "La compression a échoué. Si votre PDF est protégé par un mot de passe, retirez d'abord la protection via l'outil \u00ab Retirer protection \u00bb.",
  MOT_DE_PASSE_INCORRECT: 'Le mot de passe saisi est incorrect pour déverrouiller le fichier. Vérifiez-le et réessayez.',
  MOT_DE_PASSE_TROP_COURT: 'Le mot de passe fourni est trop court (4 caractères minimum requis).',
  PLAGE_INVALIDE: 'La sélection de pages est invalide. Vérifiez que les numéros de pages existent dans votre document.',
  PDF_CHIFFRE: "Ce PDF est protégé par un mot de passe. Retirez d'abord la protection avec l'outil \u00ab Retirer protection \u00bb, puis réessayez.",
  TYPE_OPERATION_INCONNU: 'Opération non reconnue. Veuillez recharger la page et réessayer.',
  AUCUNE_IMAGE_EMBARQUEE_TROUVEE: 'Aucune image embarquée n\'a été trouvée dans les pages sélectionnées. Essayez d\'autres pages ou vérifiez que votre PDF contient bien des images incorporées.',
  ECHEC_EXTRACTION_IMAGES: 'L\'extraction des images a échoué. Assurez-vous que votre PDF n\'est pas protégé ou corrompu.',
  INTEGRATION_IMAGE_ECHOUEE: 'L\'intégration de l\'image a échoué. Vérifiez le format de l\'image (PNG ou JPG uniquement).',
  // Paiement / Abonnement
  ESSAI_EXPIRE: "Votre période d'essai de 7 jours est terminée. Rendez-vous sur la page Tarifs pour choisir un plan.",
  ABONNEMENT_EXPIRE: "Votre abonnement Pro a expiré. Renouvelez-le sur la page Tarifs pour continuer.",
  ABONNEMENT_REQUIS: "Cette fonctionnalité nécessite un abonnement actif. Consultez la page Tarifs.",
  ABONNEMENT_DEJA_ACTIF: "Vous avez déjà un abonnement Pro actif.",
  PAYDUNYA_ERREUR: "Une erreur est survenue lors de l'initiation du paiement. Réessayez dans quelques instants.",
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
          const { titre, message } = getSuccessMessage(tool);
          ajouterNotification({
            type: 'success',
            titre,
            message,
            jobId: jobId,
            resultatUrl: job.resultat_url ? `/files/download/${job.resultat_url.split('/').pop()}` : null,
          });
          onCompleteRef.current(job);
        } else if (job.statut === 'error') {
          active = false;
          const raw = job.erreur_message || '';
          const codeMatch = Object.keys(MESSAGES_ERREUR).find(code => raw.startsWith(code));
          const msgFinal = codeMatch
            ? MESSAGES_ERREUR[codeMatch]
            : (raw || 'Une erreur inattendue est survenue. Veuillez réessayer dans quelques instants.');
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
