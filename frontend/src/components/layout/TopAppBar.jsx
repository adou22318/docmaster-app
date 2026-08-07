import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const TopAppBar = () => {
  const user = useAuthStore((state) => state.user);
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Atelier', path: '/dashboard', exact: true },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <header className="flex justify-between items-center w-full px-margin-desktop h-20 z-30 sticky top-0 bg-surface dark:bg-surface-container-highest shadow-[0_4px_40px_rgba(26,28,30,0.08)]">
      
      {/* Left side: Logo & Navigation */}
      <div className="flex items-center gap-8 flex-1">
        <Link to="/dashboard" className="flex items-center gap-3 mr-4">
          <div className="w-10 h-10 bg-secondary-container rounded flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          </div>
          <span className="font-display-xl text-headline-md text-primary hidden md:block">DocMaster</span>
        </Link>
        
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              className={`font-label-bold py-1 transition-colors duration-200 border-b-2 ${
                isActive(link) 
                  ? 'text-secondary-container border-secondary-container' 
                  : 'text-on-surface-variant border-transparent hover:text-secondary-fixed-dim'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-6 ml-auto">
        <div className="flex gap-4">
          <Link to="/dashboard/files" className="w-10 h-10 flex items-center justify-center text-primary dark:text-on-surface hover:bg-surface-container transition-colors rounded-full" title="Mes Fichiers">
            <span className="material-symbols-outlined">folder_open</span>
          </Link>
          <button className="w-10 h-10 flex items-center justify-center text-primary dark:text-on-surface hover:bg-surface-container transition-colors rounded-full relative" title="Notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
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
  );
};
