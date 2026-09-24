import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

// ─── Dictionnaire opérations ─────────────────────────────────
const OP_LABELS = {
  merge:                  'Fusion de PDF',
  split:                  'Séparation',
  compress:               'Compression',
  rotate:                 'Rotation de pages',
  rotate_pages:           'Rotation de pages',
  remove_pages:           'Suppression de pages',
  delete_pages:           'Suppression de pages',
  reorder_pages:          'Réorganisation de pages',
  extract_pages:          'Extraction de pages',
  protect:                'Protection',
  unprotect:              'Suppression de protection',
  watermark:              'Filigrane',
  extract_images:         "Extraction d'images",
  add_image:              "Ajout d'images",
  add_images:             "Ajout d'images",
  add_blank_page:         'Ajout de pages vierges',
  add_blank_pages:        'Ajout de pages vierges',
  pdf_to_images:          'PDF → Images',
  convert_to_images:      'PDF → Images',
  images_to_pdf:          'Images → PDF',
  convert_images_to_pdf:  'Images → PDF',
  convert_to_pdf:         'Office → PDF',
  office_to_pdf:          'Office → PDF',
  pdf_to_txt:             'PDF → Texte',
  clean_metadata:         'Nettoyage des métadonnées',
  sign:                   'Signature électronique',
};

// ─── Formater la durée en secondes ───────────────────────────
const formatDuration = (sec) => {
  if (sec === null || sec === undefined) return '—';
  const s = Number(sec);
  if (s < 2)  return '< 1 s';
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min ${s % 60} s`;
};

// ─── Badges ───────────────────────────────────────────────────
const JobStatusBadge = ({ statut }) => {
  const config = {
    done:       { label: 'Réussi',     bg: 'bg-secondary-container', text: 'text-on-secondary-container', icon: 'check_circle' },
    error:      { label: 'Échec',      bg: 'bg-error/10',            text: 'text-error',                  icon: 'cancel' },
    processing: { label: 'En cours',   bg: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: 'autorenew' },
    pending:    { label: 'En attente', bg: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: 'hourglass_empty' },
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
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterFailed, setFilterFailed] = useState(false);
  const [expandedJob, setExpandedJob]   = useState(null);

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
          <h1 className="font-display-xl text-headline-lg text-primary mb-1">Jobs & Erreurs</h1>
          <p className="text-on-surface-variant text-body-md">Historique des traitements PDF avec durées.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle erreurs */}
          <button
            onClick={() => setFilterFailed(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-label-md font-label-bold transition-colors ${
              filterFailed
                ? 'bg-error/10 text-error border border-error/30'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: filterFailed ? "'FILL' 1" : "'FILL' 0" }}>
              cancel
            </span>
            Échecs uniquement
          </button>
          <button
            onClick={() => fetchJobs(filterFailed)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-label-sm font-label-bold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
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
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Opération</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Utilisateur</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Statut</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Durée</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider text-right">Détail</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <React.Fragment key={job.id_jobs}>
                  <tr className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-4 font-label-bold text-body-sm text-on-surface">
                      {OP_LABELS[job.type_operation] || job.type_operation}
                    </td>
                    <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden sm:table-cell">
                      {job.email || '—'}
                    </td>
                    <td className="py-4 px-4"><JobStatusBadge statut={job.statut} /></td>
                    <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden md:table-cell">
                      {formatDuration(job.duree_secondes)}
                    </td>
                    <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden lg:table-cell">
                      {new Date(job.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {job.erreur_message && (
                        <button
                          onClick={() => setExpandedJob(expandedJob === job.id_jobs ? null : job.id_jobs)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-label-sm font-label-bold text-error hover:bg-error/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {expandedJob === job.id_jobs ? 'expand_less' : 'expand_more'}
                          </span>
                          Voir erreur
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Ligne d'expansion du message d'erreur */}
                  {expandedJob === job.id_jobs && job.erreur_message && (
                    <tr className="bg-error/5 border-b border-error/20">
                      <td colSpan="6" className="px-6 py-3">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-error mt-0.5 shrink-0">error</span>
                          <pre className="text-label-sm text-error font-mono whitespace-pre-wrap break-all">
                            {job.erreur_message}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant block mb-2">
                      {filterFailed ? 'check_circle' : 'manufacturing'}
                    </span>
                    <p className="text-on-surface-variant text-body-sm">
                      {filterFailed ? 'Aucun job en échec. Tout fonctionne !' : 'Aucun job trouvé.'}
                    </p>
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
