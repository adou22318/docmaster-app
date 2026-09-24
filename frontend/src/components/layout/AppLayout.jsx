import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { UnifiedFooter } from './UnifiedFooter';
import { getStatutAbonnement } from '../../services/api/paymentApi';

export const AppLayout = () => {
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStatutAbonnement()
      .then(res => {
        if (!cancelled) setPlanInfo(res.data.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex justify-center items-center">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  const isExpired = planInfo?.statut === 'expire' || planInfo?.statut === 'annule' || (planInfo?.joursRestants !== null && planInfo?.joursRestants <= 0);

  if (isExpired) {
    return (
      <div className="fixed inset-0 z-[9999] bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-error/10 rounded-2xl flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[40px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
            block
          </span>
        </div>
        <h1 className="text-headline-lg font-display-xl text-primary mb-3">
          Abonnement expiré
        </h1>
        <p className="text-body-lg text-on-surface-variant mb-8 max-w-md">
          Votre période d'essai ou votre abonnement est arrivé à terme. Vous ne pouvez plus accéder à l'atelier. Pour continuer à utiliser DocMaster, veuillez choisir un plan.
        </p>
        <div className="flex gap-4">
          <Link to="/" className="px-6 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-label-bold hover:bg-surface-container transition-colors">
            Retour à l'accueil
          </Link>
          <Link to="/pricing" className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-bold shadow-sm hover:bg-primary/90 transition-colors">
            Voir les offres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md custom-scrollbar overflow-x-hidden min-h-screen flex flex-col">
      <TopAppBar externalPlanInfo={planInfo} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <UnifiedFooter />
    </div>
  );
};
