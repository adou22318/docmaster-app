import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useTheme } from './hooks/useTheme';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { ToolPage } from './pages/ToolPage';
import { FilesPage } from './pages/FilesPage';
import { SettingsPage } from './pages/SettingsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { FreePage } from './pages/FreePage';
import { HelpPage } from './pages/HelpPage';
import PricingPage from './pages/PricingPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Wrapper qui force le remontage complet de ToolPage lors d'un changement d'outil.
// Sans cela, React réutilise le même composant et l'état de l'outil précédent
// contamine le nouvel outil (page blanche, étape incorrecte, etc.)
const ToolPageWrapper = () => {
  const { toolId } = useParams();
  return <ToolPage key={toolId} />;
};

// Revenir en haut de page à chaque changement de route.
// On désactive history.scrollRestoration pour que le navigateur ne restaure
// pas lui-même la position précédente (comportement par défaut des SPA).
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Désactivation de la restauration automatique du navigateur
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Scroll sur tous les conteneurs possibles pour couvrir tous les navigateurs
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
};

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  // Initialiser le thème dès le montage (applique .dark sur <html> si nécessaire)
  useTheme();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Routes sans Layout global (Standalone) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Routes Publiques avec Layout Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/free" element={<FreePage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>
        
        {/* Routes Connectées (Atelier) */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tools/:toolId" element={<ToolPageWrapper />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Route fallback — Page 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
