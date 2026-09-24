import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const ProtectedAdminRoute = () => {
  const user = useAuthStore((state) => state.user);

  const location = useLocation();

  // S'il n'est pas connecté du tout, renvoyer au login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // S'il est connecté mais n'est pas admin, renvoyer au dashboard normal
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Si tout est bon, afficher les routes enfants
  return <Outlet />;
};

export default ProtectedAdminRoute;
