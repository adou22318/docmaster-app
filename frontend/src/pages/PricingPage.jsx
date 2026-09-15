import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { getStatutAbonnement, initierPaiement, confirmRetour } from '../services/api/paymentApi.js';

// ─── Bandeau de statut ────────────────────────────────────────
const StatutBandeau = ({ statut, joursRestants, dateExpiration }) => {
  const configs = {
    essai_ok:  { bg: 'bg-blue-500/10 border-blue-500/30',  text: 'text-blue-700',  icon: 'info'     },
    essai_warn:{ bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-700', icon: 'warning'  },
    expire:    { bg: 'bg-red-500/10 border-red-500/30',    text: 'text-red-700',   icon: 'error'    },
    actif:     { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-700', icon: 'verified' },
  };

  let key = null;
  let message = '';

  if (statut === 'essai' && joursRestants > 2) {
    key = 'essai_ok';
    message = `Période d'essai en cours — ${joursRestants} jour${joursRestants > 1 ? 's' : ''} restant${joursRestants > 1 ? 's' : ''}.`;
  } else if (statut === 'essai' && joursRestants <= 2) {
    key = 'essai_warn';
    message = `⚠️ Plus que ${joursRestants} jour${joursRestants > 1 ? 's' : ''} d'essai gratuit. Passez au Pro maintenant.`;
  } else if (statut === 'expire') {
    key = 'expire';
    message = "Votre période d'essai est terminée. Choisissez un plan pour continuer.";
  } else if (statut === 'actif') {
    key = 'actif';
    message = `Abonnement Pro actif. Prochain renouvellement : ${dateExpiration ? new Date(dateExpiration).toLocaleDateString('fr-FR') : '—'}.`;
  }

  if (!key) return null;
  const c = configs[key];
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${c.bg} mb-8`}>
      <span className={`material-symbols-outlined text-[20px] ${c.text} flex-shrink-0`}
        style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
      <p className={`text-sm ${c.text}`}>{message}</p>
    </div>
  );
};

// ─── Carte de plan ─────────────────────────────────────────────
const PlanCard = ({ plan, isCurrentPlan, onAction, loading, isAbonneActif }) => {
  const isPro = plan.id === 'pro';

  return (
    <div className={`flex flex-col rounded-3xl border-2 transition-all
      ${isPro ? 'border-primary shadow-xl shadow-primary/10' : 'border-outline-variant bg-surface-container'}`}>

      {isPro && (
        <div className="rounded-t-[22px] bg-gradient-to-br from-primary to-secondary px-8 pt-6 pb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-3">
            <span className="material-symbols-outlined text-[13px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            Recommandé
          </span>
          <h2 className="font-bold text-xl text-white mb-1">{plan.nom}</h2>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{plan.prix.toLocaleString('fr-FR')}</span>
            <span className="text-sm text-white/70 ml-1">XOF / mois</span>
          </div>
        </div>
      )}

      <div className={`p-8 ${isPro ? 'pt-6 bg-primary/5' : 'pt-8'} pb-4 flex-1`}>
        {!isPro && (
          <>
            <h2 className="font-bold text-xl text-on-surface mb-1">{plan.nom}</h2>
            <div className="flex items-baseline gap-1 mt-3 mb-6">
              <span className="text-3xl font-bold text-on-surface">Gratuit</span>
            </div>
          </>
        )}
        {isPro && <div className="mb-4" />}

        <ul className="space-y-3">
          {plan.features.map((feat, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0 ${isPro ? 'text-primary' : 'text-green-600'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-sm text-on-surface">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`px-8 pb-8 pt-4 ${isPro ? 'bg-primary/5 rounded-b-[22px]' : ''}`}>
        {isAbonneActif && isPro ? (
          <div className="w-full py-3.5 rounded-2xl border-2 border-primary text-center text-sm text-primary font-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Votre plan actuel
          </div>
        ) : isCurrentPlan && !isPro ? (
          <div className="w-full py-3.5 rounded-2xl border-2 border-outline-variant text-center text-sm text-on-surface-variant">
            Plan actuel
          </div>
        ) : (
          <button
            onClick={() => onAction(plan.id)}
            disabled={loading && isPro}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all
              ${isPro
                ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-md shadow-primary/20 disabled:opacity-60'
                : 'bg-surface border-2 border-outline-variant text-on-surface hover:border-primary/40'}`}
          >
            {loading && isPro ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Redirection…
              </>
            ) : plan.cta}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────
// Rendu dans PublicLayout → hérite du PublicHeader et UnifiedFooter communs
export default function PricingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isConnected = !!user;

  const [abonnement, setAbonnement] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [alerte, setAlerte] = useState(null);
  const [retourMessage, setRetourMessage] = useState(null);
  const [paydunyaStatus, setPaydunyaStatus] = useState(null);
  const confirmationFaite = useRef(false);

  const chargerStatut = useCallback(async () => {
    if (!isConnected) { setPageLoading(false); return; }
    try {
      const res = await getStatutAbonnement();
      setAbonnement(res.data.data);
    } catch { /* silencieux */ }
    finally { setPageLoading(false); }
  }, [isConnected]);

  // EFFET 1 — Lecture de l'URL au montage (avant que l'auth soit prête)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    window.history.replaceState({}, '', '/pricing');

    if (status === 'success') {
      setPaydunyaStatus('success');
      setRetourMessage({ type: 'pending', text: 'Vérification du paiement en cours…' });
    } else if (status === 'cancel') {
      setPaydunyaStatus('cancel');
      setRetourMessage({ type: 'info', text: 'Paiement annulé. Vous pouvez réessayer à tout moment.' });
    }

    const alerteStockee = sessionStorage.getItem('pricing_alert');
    if (alerteStockee) {
      try { setAlerte(JSON.parse(alerteStockee)); } catch {}
      sessionStorage.removeItem('pricing_alert');
    }
  }, []);

  // EFFET 2 — Déclenché quand l'auth est initialisée (isLoading → false)
  useEffect(() => {
    if (isLoading) return;

    if (paydunyaStatus === 'success' && !confirmationFaite.current) {
      confirmationFaite.current = true;

      if (!isConnected) {
        setRetourMessage({ type: 'warning', text: 'Session expirée. Reconnectez-vous pour vérifier votre paiement.' });
        setPageLoading(false);
        return;
      }

      confirmRetour()
        .then((res) => {
          const ab = res.data.data.abonnement;
          setAbonnement(ab);
          if (ab.statut === 'actif') {
            setRetourMessage({ type: 'success', text: 'Paiement confirmé ! Bienvenue dans DocMaster Pro. Reconnectez-vous pour activer le badge Pro.' });
          } else {
            setRetourMessage({ type: 'info', text: 'Paiement reçu, activation en cours. Reconnectez-vous dans quelques instants.' });
          }
          setPageLoading(false);
        })
        .catch((err) => {
          console.error('[PricingPage] confirmRetour error:', err?.response?.data);
          setRetourMessage({ type: 'warning', text: "Impossible de vérifier le paiement pour l'instant. Reconnectez-vous : si le paiement a bien été effectué, votre statut Pro sera à jour." });
          chargerStatut();
        });
      return;
    }

    chargerStatut();
  }, [isLoading, paydunyaStatus, isConnected, chargerStatut]);

  const handlePasserAuPro = async () => {
    if (!isConnected) { navigate('/login?redirect=/pricing'); return; }
    setChargement(true);
    try {
      const res = await initierPaiement();
      window.location.href = res.data.data.paymentUrl;
    } catch (err) {
      setAlerte({ message: err.response?.data?.message || "Impossible d'initier le paiement. Réessayez." });
      setChargement(false);
    }
  };

  const isAbonneActif = abonnement?.statut === 'actif';

  const plans = [
    {
      id: 'free', nom: 'Gratuit', prix: 0,
      cta: isConnected ? 'Rester sur ce plan' : 'Commencer gratuitement',
      features: [
        "500 Mo de stockage",
        "16 outils PDF inclus",
        "Fusion, split, compression, rotation…",
        "Signature électronique simple",
        "Conversion Office → PDF",
        "7 jours d'essai gratuit"
      ]
    },
    {
      id: 'pro', nom: 'Pro', prix: 5000, cta: 'Passer au Pro',
      features: [
        "5 Go de stockage",
        "16 outils PDF inclus",
        "Fusion, split, compression, rotation…",
        "Signature électronique simple",
        "Conversion Office → PDF",
        "Extraction d'images embarquées (Pro)",
        "Traitements prioritaires",
        "Support prioritaire"
      ]
    }
  ];

  const isCurrentPlan = (planId) => {
    if (!abonnement) return planId === 'free';
    return isAbonneActif ? planId === 'pro' : planId === 'free';
  };

  const retourStyles = {
    success: 'bg-green-500/10 border-green-500/30 text-green-700',
    pending: 'bg-blue-500/10 border-blue-500/30 text-blue-700',
    info:    'bg-blue-500/10 border-blue-500/30 text-blue-700',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-700',
  };
  const retourIcons = { success: 'check_circle', pending: 'progress_activity', info: 'info', warning: 'warning' };

  return (
    // pt-24 pour compenser le header fixe de PublicLayout (h-20 = 80px)
    <div className="pt-24 pb-16 px-4 md:px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* Message retour PayDunya */}
        {retourMessage && (
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border mb-8 ${retourStyles[retourMessage.type]}`}>
            <span
              className={`material-symbols-outlined text-[20px] flex-shrink-0 ${retourMessage.type === 'pending' ? 'animate-spin' : ''}`}
              style={{ fontVariationSettings: "'FILL' 1" }}>
              {retourIcons[retourMessage.type]}
            </span>
            <p className="text-sm">{retourMessage.text}</p>
          </div>
        )}

        {/* Alerte erreur */}
        {alerte && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border bg-red-500/10 border-red-500/30 mb-8">
            <span className="material-symbols-outlined text-[20px] text-red-600 flex-shrink-0 mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">Erreur</p>
              <p className="text-sm text-red-600 mt-0.5">{alerte.message}</p>
            </div>
            <button onClick={() => setAlerte(null)} className="text-red-400 hover:text-red-600">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Titre — icône du design system, pas d'emoji */}
        <div className="text-center mb-10">
          {isAbonneActif ? (
            <div className="inline-flex flex-col items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              </div>
              <h1 className="text-3xl font-bold text-on-surface">Vous êtes Pro !</h1>
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-on-surface mb-3">Choisissez votre plan</h1>
          )}
          <p className="text-base text-on-surface-variant max-w-md mx-auto">
            {isAbonneActif
              ? 'Vous bénéficiez de tous les avantages DocMaster Pro. Merci de votre confiance !'
              : "Commencez gratuitement avec 7 jours d'essai, passez au Pro quand vous êtes prêt."}
          </p>
        </div>

        {/* Bandeau statut */}
        {!pageLoading && abonnement && (
          <div className="max-w-2xl mx-auto">
            <StatutBandeau statut={abonnement.statut} joursRestants={abonnement.joursRestants} dateExpiration={abonnement.dateExpiration} />
          </div>
        )}

        {/* Grille des plans */}
        {pageLoading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant animate-spin">progress_activity</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-start">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isCurrentPlan(plan.id)}
                isAbonneActif={isAbonneActif}
                onAction={plan.id === 'pro' ? handlePasserAuPro : () => navigate('/dashboard')}
                loading={chargement}
              />
            ))}
          </div>
        )}

        {/* Garanties */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { icon: 'lock',        text: 'Paiement sécurisé via PayDunya' },
            { icon: 'smartphone',  text: 'Mobile Money (Orange, Moov, MTN…)' },
            { icon: 'cancel',      text: 'Résiliation à tout moment' },
            { icon: 'security',    text: 'Données sécurisées et chiffrées' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-container text-center">
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant"
                style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <p className="text-xs text-on-surface-variant leading-snug">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-on-surface-variant/50">
          <span className="material-symbols-outlined text-[14px]">science</span>
          <span>Mode test PayDunya — aucun vrai débit ne sera effectué.</span>
        </div>
      </div>
    </div>
  );
}
