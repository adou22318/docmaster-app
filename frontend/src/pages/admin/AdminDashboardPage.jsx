import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

// ─── Dictionnaire complet opérations → français ──────────────
const OP_LABELS = {
  merge:                  'Fusion de PDF',
  split:                  'Séparation',
  compress:               'Compression',
  rotate_pages:           'Rotation de pages',
  delete_pages:           'Suppression de pages',
  reorder_pages:          'Réorganisation de pages',
  extract_pages:          'Extraction de pages',
  protect:                'Protection par mot de passe',
  unprotect:              'Suppression de protection',
  watermark:              'Filigrane',
  extract_images:         "Extraction d'images",
  add_images:             "Ajout d'images",
  add_blank_pages:        'Ajout de pages vierges',
  convert_to_images:      'PDF → Images',
  images_to_pdf:          'Images → PDF',
  convert_images_to_pdf:  'Images → PDF',
  office_to_pdf:          'Office → PDF',
  pdf_to_txt:             'PDF → Texte',
  clean_metadata:         'Nettoyage des métadonnées',
  sign:                   'Signature électronique',
};

// ─── Traductions d'actions audit ─────────────────────────────
const ACTION_META = {
  ACTIVATE_ACCOUNT:   { label: 'Compte réactivé',  icon: 'check_circle', color: 'text-secondary', bg: 'bg-secondary-container/30' },
  DEACTIVATE_ACCOUNT: { label: 'Compte désactivé', icon: 'block',        color: 'text-error',     bg: 'bg-error/10' },
};

// ─── Barre CSS proportionnelle ────────────────────────────────
const MiniBar = ({ label, pct, count }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-outline-variant/40 last:border-0">
    <span className="text-body-sm text-on-surface-variant w-48 truncate shrink-0" title={label}>
      {label}
    </span>
    <div className="flex-1 bg-surface-container-high rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-secondary rounded-full transition-all duration-700"
        style={{ width: `${Math.max(pct, 2)}%` }}
      />
    </div>
    <span className="text-label-sm font-label-bold text-secondary w-8 text-right shrink-0">
      {count}
    </span>
  </div>
);

// ─── Carte KPI ────────────────────────────────────────────────
const StatCard = ({ label, value, icon, trend, accent = false, danger = false }) => (
  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 hover:border-secondary transition-colors">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
        danger ? 'bg-error/10' : accent ? 'bg-secondary-container' : 'bg-surface-container-high'
      }`}>
        <span
          className={`material-symbols-outlined text-[22px] ${
            danger ? 'text-error' : accent ? 'text-on-secondary-container' : 'text-on-surface-variant'
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      {/* Tendance — affichée seulement si > 0 */}
      {trend > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-label-bold bg-secondary-container/30 text-secondary">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            trending_up
          </span>
          +{trend}
        </span>
      )}
    </div>
    <p className={`font-display-xl text-headline-lg leading-none mb-1 ${
      danger ? 'text-error' : accent ? 'text-secondary' : 'text-primary'
    }`}>
      {value ?? '—'}
    </p>
    <p className="text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">
      {label}
    </p>
    {trend === 0 && (
      <p className="text-label-sm text-on-surface-variant/60 mt-1">Aucun nouveau cette semaine</p>
    )}
  </div>
);

// ─── Page ────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = () => {
    setLoading(true);
    axiosClient.get('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => setError("Impossible de charger les statistiques."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display-xl text-headline-lg text-primary mb-1">Tableau de bord</h1>
          <p className="text-on-surface-variant text-body-md">Vue d'ensemble en temps réel de la plateforme.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-label-sm font-label-bold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-error/10 text-error border border-error/20 p-4 rounded-xl">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-24">
          <span className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {stats && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Utilisateurs inscrits"
              value={stats.totalUsers}
              icon="group"
              trend={stats.newUsersWeek}
            />
            <StatCard
              label="Abonnements actifs"
              value={stats.activeSubscriptions}
              icon="card_membership"
              accent
            />
            <StatCard
              label="Jobs réussis (24h)"
              value={stats.jobs24h?.done ?? 0}
              icon="check_circle"
              accent
            />
            <StatCard
              label="Jobs en échec (24h)"
              value={stats.jobs24h?.error ?? 0}
              icon="cancel"
              danger
            />
          </div>

          {/* Section basse */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top opérations */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    bar_chart
                  </span>
                </div>
                <div>
                  <h2 className="font-label-bold text-label-lg text-on-surface">Top opérations</h2>
                  <p className="text-label-sm text-on-surface-variant">7 derniers jours • jobs réussis</p>
                </div>
              </div>

              {stats.topOps?.length > 0 ? (
                <div>
                  {stats.topOps.map((op) => (
                    <MiniBar
                      key={op.operation}
                      label={OP_LABELS[op.operation] || op.operation}
                      pct={op.pct}
                      count={op.count}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2">bar_chart</span>
                  <p className="text-body-sm text-on-surface-variant">Aucune opération réussie cette semaine.</p>
                </div>
              )}
            </div>

            {/* Activité récente */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    history
                  </span>
                </div>
                <div>
                  <h2 className="font-label-bold text-label-lg text-on-surface">Activité récente</h2>
                  <p className="text-label-sm text-on-surface-variant">Dernières actions d'administration</p>
                </div>
              </div>

              {stats.recentAudit?.length > 0 ? (
                <div className="space-y-1">
                  {stats.recentAudit.map((log, idx) => {
                    const a = ACTION_META[log.action] || { label: log.action, icon: 'edit', color: 'text-on-surface-variant', bg: '' };
                    return (
                      <div key={idx} className="flex items-start gap-3 py-2.5 border-b border-outline-variant/40 last:border-0">
                        <span
                          className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${a.color}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {a.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-body-sm text-on-surface leading-snug">
                            <span className="font-label-bold text-primary">{log.admin_email}</span>
                            {' · '}
                            <span className="lowercase">{a.label}</span>
                            {log.cible_email && (
                              <> de <span className="font-label-bold">{log.cible_email}</span></>
                            )}
                          </p>
                          <p className="text-label-sm text-on-surface-variant mt-0.5">
                            {new Date(log.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2">history</span>
                  <p className="text-body-sm text-on-surface-variant">Aucune action administrative récente.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
