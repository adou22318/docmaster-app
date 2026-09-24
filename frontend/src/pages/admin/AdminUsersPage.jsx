import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/admin/users?limit=100');
      setUsers(data.data);
    } catch (error) {
      console.error('Erreur', error);
      setErrorMsg("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await axiosClient.patch(`/admin/users/${userId}/status`, {
        compte_actif: !currentStatus
      });
      // Mettre à jour localement
      setUsers(users.map(u => u.id_users === userId ? { ...u, compte_actif: !currentStatus } : u));
      setErrorMsg(null);
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de la modification.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Gestion des Utilisateurs</h1>
      
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Nom Complet</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id_users} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{user.email}</td>
                  <td className="px-6 py-4">{user.nom_complet || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.compte_actif ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {user.compte_actif ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleStatus(user.id_users, user.compte_actif)}
                      className={`text-sm px-3 py-1 rounded-md transition-colors ${
                        user.compte_actif 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {user.compte_actif ? 'Désactiver' : 'Activer'}
                    </button>
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

export default AdminUsersPage;
