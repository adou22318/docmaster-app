import React from 'react';
import { DropZone } from '../components/dashboard/DropZone';
import { DashboardTools } from '../components/dashboard/DashboardTools';
import { RecentFiles } from '../components/dashboard/RecentFiles';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export const Dashboard = () => {
  const { ref, inView } = useScrollAnimation(0);

  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-12 max-w-[1600px] mx-auto overflow-x-hidden">
      {/* Welcome Header */}
      <section ref={ref} className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade ${inView ? 'visible' : ''}`}>
        <div>
          <h2 className="font-display-xl text-headline-lg text-primary mb-2">Bienvenue dans votre atelier.</h2>
          <p className="text-body-lg text-on-surface-variant">Importez un fichier pour commencer une nouvelle manipulation.</p>
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
