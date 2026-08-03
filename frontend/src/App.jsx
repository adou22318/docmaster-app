import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Signature } from './pages/tools/Signature';
import { Compression } from './pages/tools/Compression';
import { Watermark } from './pages/tools/Watermark';
import { Security } from './pages/tools/Security';
import { Conversion } from './pages/tools/Conversion';
import { SplitMerge } from './pages/tools/SplitMerge';

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes sans Layout global (Standalone) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Routes Publiques avec Layout Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
        
        {/* Routes Connectées (Atelier) */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tools/sign" element={<Signature />} />
            <Route path="tools/compress" element={<Compression />} />
            <Route path="tools/watermark" element={<Watermark />} />
            <Route path="tools/security" element={<Security />} />
            <Route path="tools/convert" element={<Conversion />} />
            <Route path="tools/split-merge" element={<SplitMerge />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
