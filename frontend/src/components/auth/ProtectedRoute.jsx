import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-secondary-container rounded flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          </div>
          <p className="font-label-bold text-primary animate-pulse tracking-widest uppercase">Chargement de l'atelier...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
