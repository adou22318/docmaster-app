import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

const AdminSubscriptionsPage = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const { data } = await axiosClient.get('/admin/subscriptions?limit=100');
        setSubs(data.data);
      } catch (error) {
        console.error('Erreur', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Abonnements</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Renouvellement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subs.map((sub) => (
                <tr key={sub.id_abonnements} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{sub.email}</td>
                  <td className="px-6 py-4 capitalize">{sub.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sub.statut === 'actif' ? 'bg-emerald-100 text-emerald-700' :
                      sub.statut === 'essai' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {sub.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {sub.date_renouvellement ? new Date(sub.date_renouvellement).toLocaleDateString('fr-FR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
