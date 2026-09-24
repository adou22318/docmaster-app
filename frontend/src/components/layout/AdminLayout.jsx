import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { NotificationDrawer } from './NotificationDrawer';

const NAV_ITEMS = [
  { name: 'Tableau de bord', path: '/admin/dashboard', icon: 'dashboard' },
  { name: 'Utilisateurs',    path: '/admin/users',     icon: 'group' },
  { name: 'Abonnements',     path: '/admin/subscriptions', icon: 'card_membership' },
  { name: 'Jobs & Erreurs',  path: '/admin/jobs',      icon: 'manufacturing' },
  { name: 'Journal Audit',   path: '/admin/audit-log', icon: 'history' },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="bg-background text-on-surface font-body-md custom-scrollbar overflow-x-hidden min-h-screen flex flex-col">
      <TopAppBar />
      <NotificationDrawer />

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar ────────────────────────────────────── */}
        <aside className="w-64 hidden md:flex flex-col bg-surface-container-low border-r border-outline-variant shrink-0">
          {/* Header sidebar */}
          <div className="px-4 py-4 border-b border-outline-variant">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-on-primary">
                  admin_panel_settings
                </span>
              </div>
              <span className="font-label-bold text-label-lg text-primary tracking-wide uppercase">
                Administration
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {/* Notch active */}
                  {isActive && (
                    <span
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-l-full bg-secondary"
                    />
                  )}
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors ${
                      isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-secondary'
                    }`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-label-md ${isActive ? 'font-label-bold' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer sidebar */}
          <div className="px-3 py-4 border-t border-outline-variant">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span className="text-label-md">Retour à l'atelier</span>
            </Link>
          </div>
        </aside>

        {/* ─── Contenu principal ─────────────────────────── */}
        <main className="flex-1 overflow-auto">
          <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
