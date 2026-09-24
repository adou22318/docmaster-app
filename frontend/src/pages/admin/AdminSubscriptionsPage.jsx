import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

const SubStatusBadge = ({ statut }) => {
  const config = {
    actif:       { label: 'Actif',       bg: 'bg-secondary-container', text: 'text-on-secondary-container', icon: 'check_circle' },
    essai:       { label: 'Essai',       bg: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: 'schedule' },
    expire:      { label: 'Expiré',      bg: 'bg-error/10', text: 'text-error', icon: 'cancel' },
    annule:      { label: 'Annulé',      bg: 'bg-error/10', text: 'text-error', icon: 'remove_circle' },
    en_attente:  { label: 'En attente',  bg: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: 'hourglass_empty' },
  };
  const c = config[statut] || config['en_attente'];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-bold ${c.bg} ${c.text}`}>
      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
      {c.label}
    </span>
  );
};

const AdminSubscriptionsPage = () => {
  const [subs, setSubs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/admin/subscriptions?limit=100')
      .then(({ data }) => setSubs(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display-xl text-headline-lg text-primary mb-1">Abonnements</h1>
        <p className="text-on-surface-variant text-body-md">Vue globale des souscriptions actives et expirées.</p>
      </div>

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
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Statut</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Renouvellement</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => (
                <tr key={sub.id_abonnements} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-4 font-label-bold text-body-sm text-primary">{sub.email}</td>
                  <td className="py-4 px-4 text-body-sm text-on-surface capitalize">{sub.plan}</td>
                  <td className="py-4 px-4"><SubStatusBadge statut={sub.statut} /></td>
                  <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden md:table-cell">
                    {sub.date_renouvellement ? new Date(sub.date_renouvellement).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-on-surface-variant text-body-sm">
                    Aucun abonnement.
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
