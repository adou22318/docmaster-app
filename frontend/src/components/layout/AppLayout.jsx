import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { AppFooter } from './AppFooter';

export const AppLayout = () => {
  return (
    <div className="bg-background text-on-surface font-body-md custom-scrollbar overflow-x-hidden min-h-screen flex flex-col">
      <TopAppBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};
