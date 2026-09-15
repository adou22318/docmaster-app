import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { UnifiedFooter } from './UnifiedFooter';

export const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <UnifiedFooter />
    </div>
  );
};
