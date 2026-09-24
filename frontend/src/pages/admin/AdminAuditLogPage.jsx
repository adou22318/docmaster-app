import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

const AdminAuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axiosClient.get('/admin/audit-log?limit=100');
        setLogs(data.data);
      } catch (error) {
        console.error('Erreur', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Journal d'Audit</h1>
      <p className="text-slate-500">Traçabilité des actions d'administration.</p>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Administrateur</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Cible (ID)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">{new Date(log.created_at).toLocaleString('fr-FR')}</td>
                  <td className="px-6 py-4 font-medium">{log.admin_email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{log.cible_id || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    Aucune action enregistrée.
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
