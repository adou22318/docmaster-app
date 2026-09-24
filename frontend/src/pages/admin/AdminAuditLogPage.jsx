import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

// ─── Traductions d'actions en français ────────────────────────
const ACTION_META = {
  ACTIVATE_ACCOUNT:   { label: 'Compte réactivé',  icon: 'check_circle', color: 'text-secondary', bg: 'bg-secondary-container/30' },
  DEACTIVATE_ACCOUNT: { label: 'Compte désactivé', icon: 'block',        color: 'text-error',     bg: 'bg-error/10' },
};

const AdminAuditLogPage = () => {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/admin/audit-log?limit=100')
      .then(({ data }) => setLogs(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display-xl text-headline-lg text-primary mb-1">Journal d'Audit</h1>
        <p className="text-on-surface-variant text-body-md">Traçabilité complète des actions d'administration.</p>
      </div>

      {/* Banière */}
      <div className="flex items-start gap-3 bg-secondary-container/20 border border-secondary/30 px-4 py-3 rounded-xl text-body-sm">
        <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
          info
        </span>
        <p className="text-on-surface-variant">
          Seules les <span className="font-label-bold text-primary">actions de modification</span> sont enregistrées.
          Les consultations de données ne sont pas journalisées.
        </p>
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
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Administrateur</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Action</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Compte concerné</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const meta = ACTION_META[log.action] || {
                  label: log.action, icon: 'edit', color: 'text-on-surface-variant', bg: 'bg-surface-container'
                };
                return (
                  <tr key={log.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-4 text-body-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4 font-label-bold text-body-sm text-primary">
                      {log.admin_email}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-label-bold ${meta.bg} ${meta.color}`}>
                        <span
                          className="material-symbols-outlined text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {meta.icon}
                        </span>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {log.cible_email ? (
                        <div>
                          <p className="text-body-sm font-label-bold text-on-surface">{log.cible_email}</p>
                          {log.cible_nom && (
                            <p className="text-label-sm text-on-surface-variant">{log.cible_nom}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant block mb-2">history</span>
                    <p className="text-on-surface-variant text-body-sm">Aucune action administrative enregistrée.</p>
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

export default AdminAuditLogPage;
