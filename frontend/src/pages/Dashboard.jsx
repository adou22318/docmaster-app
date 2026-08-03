import React from 'react';
import { DropZone } from '../components/dashboard/DropZone';
import { DashboardTools } from '../components/dashboard/DashboardTools';
import { RecentFiles } from '../components/dashboard/RecentFiles';

export const Dashboard = () => {
  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-12 max-w-[1600px] mx-auto">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display-xl text-headline-lg text-primary mb-2">Bienvenue dans votre atelier.</h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">Prêt à transformer vos documents techniques ? Déposez vos fichiers ci-dessous pour commencer une nouvelle manipulation.</p>
        </div>
        <div className="hidden lg:block text-right">
          <div className="inline-flex items-center px-4 py-2 bg-surface-container-high rounded-full gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-label-bold text-label-sm">Système Opérationnel</span>
          </div>
        </div>
      </section>

      {/* Main Zone de Dépôt */}
      <DropZone />

      {/* Asymmetric Grid for Files and Modules */}
      <DashboardTools />

      {/* Fichiers Récents */}
      <RecentFiles />
    </div>
  );
};
