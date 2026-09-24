import React, { useEffect, useState, useRef } from 'react';
import axiosClient from '../../services/api/axiosClient';

// ─── Modale de confirmation ───────────────────────────────────
const ConfirmModal = ({ user, onConfirm, onCancel }) => {
  const willDeactivate = user?.compte_actif;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface border border-outline-variant rounded-2xl shadow-lg p-6 max-w-sm w-full animate-scale visible">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${willDeactivate ? 'bg-error/10' : 'bg-secondary-container'}`}>
          <span
            className={`material-symbols-outlined text-[24px] ${willDeactivate ? 'text-error' : 'text-secondary'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {willDeactivate ? 'block' : 'check_circle'}
          </span>
        </div>
        <h3 className="font-label-bold text-title-md text-primary mb-1">
          {willDeactivate ? 'Désactiver ce compte ?' : 'Réactiver ce compte ?'}
        </h3>
        <p className="text-body-sm text-on-surface-variant mb-6">
          {willDeactivate
            ? <>L'utilisateur <strong>{user.email}</strong> ne pourra plus se connecter. Il pourra être réactivé à tout moment.</>
            : <>L'utilisateur <strong>{user.email}</strong> pourra à nouveau accéder à la plateforme.</>
          }
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-label-md font-label-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-label-md font-label-bold transition-colors ${
              willDeactivate
                ? 'bg-error text-on-error hover:bg-error/90'
                : 'bg-primary text-on-primary hover:bg-primary/90'
            }`}
          >
            {willDeactivate ? 'Désactiver' : 'Réactiver'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Badges ───────────────────────────────────────────────────
const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-bold ${
    active ? 'bg-secondary-container text-on-secondary-container' : 'bg-error/10 text-error'
  }`}>
    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
      {active ? 'check_circle' : 'cancel'}
    </span>
    {active ? 'Actif' : 'Désactivé'}
  </span>
);

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-bold ${
    role === 'admin' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
  }`}>
    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
      {role === 'admin' ? 'shield' : 'person'}
    </span>
    {role}
  </span>
);

// ─── Page ────────────────────────────────────────────────────
const AdminUsersPage = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [search, setSearch]     = useState('');
  const [pendingUser, setPendingUser] = useState(null); // user en attente de confirmation
  const searchTimer = useRef(null);

  const fetchUsers = async (q = search) => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(`/admin/users?limit=100&search=${encodeURIComponent(q)}`);
      setUsers(data.data);
      setErrorMsg(null);
    } catch {
      setErrorMsg("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(''); }, []);

  // Recherche avec debounce 300ms
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchUsers(val), 300);
  };

  const confirmToggle = async () => {
    if (!pendingUser) return;
    try {
      await axiosClient.patch(`/admin/users/${pendingUser.id_users}/status`, {
        compte_actif: !pendingUser.compte_actif
      });
      setUsers(u => u.map(x =>
        x.id_users === pendingUser.id_users ? { ...x, compte_actif: !pendingUser.compte_actif } : x
      ));
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Erreur lors de la modification.");
    } finally {
      setPendingUser(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display-xl text-headline-lg text-primary mb-1">Utilisateurs</h1>
          <p className="text-on-surface-variant text-body-md">
            {users.length} compte{users.length > 1 ? 's' : ''} affiché{users.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-label-sm font-label-bold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par email ou nom…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md placeholder:text-on-surface-variant focus:outline-none focus:border-secondary transition-colors"
        />
        {search && (
          <button
            onClick={() => { setSearch(''); fetchUsers(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Erreur */}
      {errorMsg && (
        <div className="flex items-center gap-3 bg-error/10 text-error border border-error/20 p-4 rounded-xl">
          <span className="material-symbols-outlined">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

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
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Utilisateur</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Rôle</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Plan</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Inscrit le</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Statut</th>
                <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id_users} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-label-bold text-body-sm text-primary truncate max-w-[200px]">{user.email}</p>
                    {user.nom_complet && (
                      <p className="text-label-sm text-on-surface-variant">{user.nom_complet}</p>
                    )}
                  </td>
                  <td className="py-4 px-4"><RoleBadge role={user.role} /></td>
                  <td className="py-4 px-4 text-body-sm text-on-surface-variant capitalize hidden md:table-cell">{user.plan}</td>
                  <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden lg:table-cell">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 px-4"><StatusBadge active={user.compte_actif} /></td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setPendingUser(user)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-bold transition-colors ${
                        user.compte_actif
                          ? 'text-error hover:bg-error/10'
                          : 'text-secondary hover:bg-secondary-container/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {user.compte_actif ? 'block' : 'check_circle'}
                      </span>
                      <span className="hidden sm:inline">{user.compte_actif ? 'Désactiver' : 'Réactiver'}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant block mb-2">
                      {search ? 'search_off' : 'group_off'}
                    </span>
                    <p className="text-on-surface-variant text-body-sm">
                      {search ? `Aucun résultat pour « ${search} »` : 'Aucun utilisateur.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modale de confirmation */}
      {pendingUser && (
        <ConfirmModal
          user={pendingUser}
          onConfirm={confirmToggle}
          onCancel={() => setPendingUser(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
