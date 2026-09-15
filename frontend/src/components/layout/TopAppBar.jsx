import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationDrawer } from './NotificationDrawer';
import { LogoutConfirmModal } from '../ui/LogoutConfirmModal';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../hooks/useTheme';
import { getStatutAbonnement } from '../../services/api/paymentApi.js';

export const TopAppBar = () => {
  const user = useAuthStore((state) => state.user);
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, toggleTheme, isDark } = useTheme();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [planInfo, setPlanInfo] = useState(null);

  // Notifications depuis le store Zustand (in-memory)
  const getNonLues = useNotificationStore((state) => state.getNonLues);
  const toutMarquerCommeLu = useNotificationStore((state) => state.toutMarquerCommeLu);
  const unreadCount = useNotificationStore((state) => state.getNonLues)();

  const handleLogout = () => setIsLogoutModalOpen(true);

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logoutUser();
    toast.info('Déconnexion réussie. À bientôt !');
    navigate('/login');
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    toutMarquerCommeLu();
  };

  // Statut d'abonnement — UNE SEULE fois au montage
  useEffect(() => {
    let cancelled = false;
    getStatutAbonnement()
      .then(res => {
        if (!cancelled) setPlanInfo(res.data.data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const isPro = planInfo?.statut === 'actif';
  const isEssai = planInfo?.statut === 'essai';

  return (
    <>
      <header className="flex justify-between items-center w-full px-margin-desktop h-20 z-30 sticky top-0 bg-surface shadow-[0_4px_40px_rgba(26,28,30,0.08)]">
        
        {/* Left — Logo & Nav */}
        <div className="flex items-center gap-8 flex-1">
          <Link to="/dashboard" className="flex items-center gap-3 mr-4">
            <div className="w-10 h-10 bg-secondary-container rounded flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            </div>
            <span className="font-display-xl text-headline-md text-primary hidden md:block">DocMaster</span>
          </Link>
        </div>
        
        {/* Right — Actions & Profile */}
        <div className="flex items-center gap-6 ml-auto">
          <div className="flex gap-2 items-center">
            <Link to="/dashboard/files"
              className="w-10 h-10 flex items-center justify-center text-primary hover:bg-surface-container transition-colors rounded-full"
              title="Mes Fichiers">
              <span className="material-symbols-outlined">folder_open</span>
            </Link>

            {/* Toggle mode sombre */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors rounded-full"
              title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isDark ? "'FILL' 1" : "'FILL' 0" }}>
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Cloche notifications */}
            <button
              onClick={handleOpenDrawer}
              className="w-10 h-10 flex items-center justify-center text-primary hover:bg-surface-container transition-colors rounded-full relative"
              title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <Link to="/dashboard/settings"
              className="w-10 h-10 flex items-center justify-center text-primary hover:bg-surface-container transition-colors rounded-full"
              title="Paramètres">
              <span className="material-symbols-outlined">settings</span>
            </Link>
            <button onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center text-error hover:bg-error-container transition-colors rounded-full"
              title="Déconnexion">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 pl-6 border-l border-outline-variant">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-primary">
                {user?.nom_complet || user?.email || 'Utilisateur'}
              </p>
              {/* Badge plan */}
              {isPro && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  PRO
                </span>
              )}
              {isEssai && !isPro && (
                <Link to="/pricing" className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-medium hover:bg-primary/10 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[10px]">schedule</span>
                  Essai · {planInfo.joursRestants}j
                </Link>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-outline-variant bg-secondary-container flex items-center justify-center">
              {user?.photo_url ? (
                <img alt="Portrait" className="w-full h-full object-cover" src={user.photo_url} />
              ) : (
                <span className="material-symbols-outlined text-primary text-xl">person</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bandeau urgence essai (≤ 2 jours) */}
      {isEssai && planInfo.joursRestants <= 2 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[15px] text-amber-600 flex-shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <p className="text-xs text-amber-700">
            ⚠️ Votre essai se termine dans <strong>{planInfo.joursRestants} jour{planInfo.joursRestants > 1 ? 's' : ''}</strong>.
          </p>
          <Link to="/pricing" className="text-xs font-bold text-amber-700 underline hover:text-amber-800 flex-shrink-0">
            Passer au Pro →
          </Link>
        </div>
      )}

      {/* Bandeau essai normal (> 2 jours) */}
      {isEssai && planInfo.joursRestants > 2 && (
        <div className="bg-surface-container border-b border-outline-variant px-4 py-1.5 flex items-center justify-center gap-3">
          <p className="text-xs text-on-surface-variant">
            Essai gratuit — {planInfo.joursRestants} jours restants.
          </p>
          <Link to="/pricing" className="text-xs text-primary hover:underline flex-shrink-0">
            En savoir plus
          </Link>
        </div>
      )}

      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};
