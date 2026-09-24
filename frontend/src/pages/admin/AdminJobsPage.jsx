import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFailed, setFilterFailed] = useState(false);

  const fetchJobs = async (failed) => {
    try {
      setLoading(true);
      const url = failed ? '/admin/jobs/failed?limit=100' : '/admin/jobs?limit=100';
      const { data } = await axiosClient.get(url);
      setJobs(data.data);
    } catch (error) {
      console.error('Erreur', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(filterFailed);
  }, [filterFailed]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Diagnostic des Jobs</h1>
        <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 cursor-pointer">
          <input 
            type="checkbox" 
            checked={filterFailed} 
            onChange={(e) => setFilterFailed(e.target.checked)} 
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Échecs uniquement</span>
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID Job</th>
                <th className="px-6 py-4">Opération</th>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Erreur (si échec)</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id_jobs} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{job.id_jobs.split('-')[0]}...</td>
                  <td className="px-6 py-4 font-medium">{job.type_operation}</td>
                  <td className="px-6 py-4">{job.email || 'Anonyme'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.statut === 'done' ? 'bg-emerald-100 text-emerald-700' : 
                      job.statut === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {job.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-red-600 max-w-xs truncate" title={job.erreur_message}>
                    {job.erreur_message || '-'}
                  </td>
                  <td className="px-6 py-4">{new Date(job.created_at).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Aucun job trouvé.
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
