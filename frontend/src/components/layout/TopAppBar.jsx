import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import axiosClient from '../../services/api/axiosClient';
import { NotificationDrawer } from './NotificationDrawer';

export const TopAppBar = () => {
  const user = useAuthStore((state) => state.user);
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };



  useEffect(() => {
    // Check unread notifications count
    const checkUnread = async () => {
      try {
        const response = await axiosClient.get('/jobs');
        if (response.data.success) {
          const lastRead = localStorage.getItem('lastNotificationReadTime');
          const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
          
          const now = new Date();
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          
          const unread = response.data.data.filter(job => {
            const completedAt = job.completed_at ? new Date(job.completed_at).getTime() : new Date(job.created_at).getTime();
            return (job.status === 'done' || job.status === 'error') 
                   && completedAt >= yesterday.getTime()
                   && completedAt > lastReadTime;
          });
          
          setUnreadCount(unread.length);
        }
      } catch (e) {
        // Ignorer silencieusement
      }
    };
    
    checkUnread();
    
    // Vérifier de temps en temps
    const interval = setInterval(checkUnread, 30000); // 30s
    return () => clearInterval(interval);
  }, [isDrawerOpen]); // Re-check after drawer is closed

  return (
    <>
      <header className="flex justify-between items-center w-full px-margin-desktop h-20 z-30 sticky top-0 bg-surface dark:bg-surface-container-highest shadow-[0_4px_40px_rgba(26,28,30,0.08)]">
        
        {/* Left side: Logo & Navigation */}
        <div className="flex items-center gap-8 flex-1">
          <Link to="/dashboard" className="flex items-center gap-3 mr-4">
            <div className="w-10 h-10 bg-secondary-container rounded flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            </div>
            <span className="font-display-xl text-headline-md text-primary hidden md:block">DocMaster</span>
          </Link>
          
          <nav className="hidden md:flex gap-8 items-center"></nav>
        </div>
        
        {/* Right side: Actions & Profile */}
        <div className="flex items-center gap-6 ml-auto">
          <div className="flex gap-4">
            <Link to="/dashboard/files" className="w-10 h-10 flex items-center justify-center text-primary dark:text-on-surface hover:bg-surface-container transition-colors rounded-full" title="Mes Fichiers">
              <span className="material-symbols-outlined">folder_open</span>
            </Link>
            <button 
              onClick={() => {
                setIsDrawerOpen(true);
                setUnreadCount(0);
              }}
              className="w-10 h-10 flex items-center justify-center text-primary dark:text-on-surface hover:bg-surface-container transition-colors rounded-full relative" 
              title="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <Link to="/dashboard/settings" className="w-10 h-10 flex items-center justify-center text-primary dark:text-on-surface hover:bg-surface-container transition-colors rounded-full" title="Paramètres">
              <span className="material-symbols-outlined">settings</span>
            </Link>
            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center text-error dark:text-error hover:bg-error-container transition-colors rounded-full" title="Déconnexion">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4 pl-6 border-l border-outline-variant">
            <div className="text-right hidden sm:block">
              <p className="font-label-bold text-label-bold text-primary">
                {user?.nom_complet || user?.email || 'Utilisateur'}
              </p>
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

      <NotificationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
};

