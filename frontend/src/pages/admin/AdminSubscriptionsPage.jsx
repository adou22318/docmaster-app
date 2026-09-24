import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

// ─── Badge plan ───────────────────────────────────────────────
const PlanBadge = ({ plan, statut }) => {
  if (plan === 'pro' && statut === 'actif') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-bold bg-primary text-on-primary">
        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
        Pro
      </span>
    );
  }
  if (statut === 'essai') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-bold bg-secondary-container text-on-secondary-container">
        <span className="material-symbols-outlined text-[12px]">schedule</span>
        Essai
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-bold bg-surface-container-high text-on-surface-variant">
      <span className="material-symbols-outlined text-[12px]">person</span>
      Gratuit
    </span>
  );
};

// ─── Jours restants ───────────────────────────────────────────
const JoursRestants = ({ jours, statut }) => {
  if (jours === null || jours === undefined) return <span className="text-on-surface-variant">—</span>;
  const n = Number(jours);
  if (n <= 0) return (
    <span className="text-label-sm font-label-bold text-error flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">warning</span>
      Expiré
    </span>
  );
  if (n <= 3) return (
    <span className="text-label-sm font-label-bold text-error">
      {n} jour{n > 1 ? 's' : ''} restant{n > 1 ? 's' : ''}
    </span>
  );
  if (n <= 10) return (
    <span className="text-label-sm font-label-bold text-secondary">
      {n} jours restants
    </span>
  );
  return (
    <span className="text-label-sm text-on-surface-variant">
      {n} jours restants
    </span>
  );
};

const AdminSubscriptionsPage = () => {
  const [subs, setSubs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('tous'); // 'tous' | 'pro' | 'essai' | 'free'

  useEffect(() => {
    axiosClient.get('/admin/subscriptions?limit=200')
      .then(({ data }) => setSubs(data.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = subs.filter(s => {
    if (filter === 'tous')  return true;
    if (filter === 'pro')   return s.plan === 'pro' && s.statut === 'actif';
    if (filter === 'essai') return s.statut === 'essai';
    if (filter === 'free')  return !s.statut || s.plan === 'free';
    return true;
  });

  const tabs = [
    { id: 'tous',  label: 'Tous',          count: subs.length },
    { id: 'pro',   label: 'Pro',           count: subs.filter(s => s.plan === 'pro' && s.statut === 'actif').length },
    { id: 'essai', label: 'Essai',         count: subs.filter(s => s.statut === 'essai').length },
    { id: 'free',  label: 'Gratuit',       count: subs.filter(s => !s.statut || s.plan === 'free').length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display-xl text-headline-lg text-primary mb-1">Abonnements</h1>
        <p className="text-on-surface-variant text-body-md">Vue complète de tous les utilisateurs et leur plan.</p>
      </div>

      {/* Onglets filtre */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-label-md font-label-bold transition-colors ${
              filter === tab.id
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            {tab.label}
            <span className={`text-label-sm px-1.5 py-0.5 rounded-full ${
              filter === tab.id ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Utilisateur</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Plan</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Durée restante</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Renouvellement</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id_users} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-label-bold text-body-sm text-primary">{sub.email}</p>
                    {sub.nom_complet && (
                      <p className="text-label-sm text-on-surface-variant">{sub.nom_complet}</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <PlanBadge plan={sub.plan} statut={sub.statut} />
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <JoursRestants jours={sub.jours_restants} statut={sub.statut} />
                  </td>
                  <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden lg:table-cell">
                    {sub.date_renouvellement
                      ? new Date(sub.date_renouvellement).toLocaleDateString('fr-FR')
                      : sub.date_fin_essai
                      ? new Date(sub.date_fin_essai).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant block mb-2">card_membership</span>
                    <p className="text-on-surface-variant text-body-sm">Aucun utilisateur dans cette catégorie.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
