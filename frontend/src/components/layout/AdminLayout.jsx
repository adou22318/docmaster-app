import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import TopAppBar from './TopAppBar'; // On réutilise la top bar existante
import NotificationDrawer from './NotificationDrawer';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Utilisateurs', path: '/admin/users', icon: '👥' },
    { name: 'Abonnements', path: '/admin/subscriptions', icon: '💳' },
    { name: 'Jobs (Erreurs)', path: '/admin/jobs', icon: '⚠️' },
    { name: 'Journal Audit', path: '/admin/audit-log', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopAppBar />
      <NotificationDrawer />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Admin */}
        <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
          <div className="p-4 bg-slate-950 font-bold text-white tracking-wider text-sm uppercase">
            Administration
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white font-medium shadow-sm' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white flex items-center">
              <span className="mr-2">←</span> Retour au site
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
