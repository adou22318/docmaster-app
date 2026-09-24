import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosClient.get('/admin/stats');
        setStats(data.data);
      } catch (error) {
        console.error('Erreur chargement stats admin', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Chargement des statistiques...</div>;
  if (!stats) return <div className="p-8 text-red-500">Erreur lors du chargement.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Utilisateurs Inscrits</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Abonnements Actifs</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.activeSubscriptions}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Jobs (24h) - Réussis</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.jobs24h.done}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Jobs (24h) - Échecs</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.jobs24h.error}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
