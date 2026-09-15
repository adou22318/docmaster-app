import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { UnifiedFooter } from './UnifiedFooter';

// Le bandeau d'essai est intégré dans TopAppBar
export const AppLayout = () => {
  return (
    <div className="bg-background text-on-surface font-body-md custom-scrollbar overflow-x-hidden min-h-screen flex flex-col">
      <TopAppBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <UnifiedFooter />
    </div>
  );
};
