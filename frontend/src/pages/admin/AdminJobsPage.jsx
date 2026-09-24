import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

const JobStatusBadge = ({ statut }) => {
  const config = {
    done:       { label: 'Réussi',      bg: 'bg-secondary-container', text: 'text-on-secondary-container', icon: 'check_circle' },
    error:      { label: 'Erreur',      bg: 'bg-error/10',            text: 'text-error',                  icon: 'cancel' },
    processing: { label: 'En cours',    bg: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: 'autorenew' },
    pending:    { label: 'En attente',  bg: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: 'hourglass_empty' },
  };
  const c = config[statut] || config['pending'];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-bold ${c.bg} ${c.text}`}>
      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
      {c.label}
    </span>
  );
};

const AdminJobsPage = () => {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterFailed, setFilterFailed] = useState(false);

  const fetchJobs = async (failed) => {
    try {
      setLoading(true);
      const url = failed ? '/admin/jobs/failed?limit=100' : '/admin/jobs?limit=100';
      const { data } = await axiosClient.get(url);
      setJobs(data.data);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(filterFailed); }, [filterFailed]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display-xl text-headline-lg text-primary mb-1">Diagnostic des Jobs</h1>
          <p className="text-on-surface-variant text-body-md">Historique des traitements PDF.</p>
        </div>

        {/* Toggle filtre */}
        <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant cursor-pointer hover:border-secondary transition-colors">
          <div
            onClick={() => setFilterFailed((v) => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${filterFailed ? 'bg-primary' : 'bg-surface-container-high'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-on-primary shadow transition-transform ${filterFailed ? 'translate-x-5' : 'translate-x-1'} ${!filterFailed ? 'bg-on-surface-variant' : ''}`} />
          </div>
          <span className="text-label-sm font-label-bold text-on-surface-variant select-none">Échecs uniquement</span>
        </label>
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
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Opération</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Utilisateur</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Statut</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Message d'erreur</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id_jobs} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-4 font-mono text-[11px] text-on-surface-variant">{job.id_jobs?.slice(0, 8)}…</td>
                  <td className="py-4 px-4 text-body-sm font-label-bold text-on-surface">{job.type_operation}</td>
                  <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden sm:table-cell">{job.email || '—'}</td>
                  <td className="py-4 px-4"><JobStatusBadge statut={job.statut} /></td>
                  <td className="py-4 px-4 text-body-sm text-error max-w-xs truncate hidden lg:table-cell" title={job.erreur_message}>
                    {job.erreur_message || '—'}
                  </td>
                  <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden md:table-cell">
                    {new Date(job.created_at).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant block mb-2">check_circle</span>
                    <span className="text-on-surface-variant text-body-sm">Aucun job trouvé.</span>
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

export default AdminJobsPage;
