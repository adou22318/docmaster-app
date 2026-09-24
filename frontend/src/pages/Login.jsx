import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const { loginUser, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Nettoyer l'erreur quand le composant est monté
  useEffect(() => {
    clearError();
    setValidationError(null);
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    setValidationError(null);

    if (!email) {
      setValidationError('Veuillez saisir votre adresse email.');
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Adresse email invalide. Vérifiez le format (exemple : nom@domaine.com)');
      setIsSubmitting(false);
      return;
    }

    const result = await loginUser(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Connexion réussie !');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <main className="asymmetric-layout">
      {/* Left Side — Brand Panel (toujours sombre, indépendant du thème) */}
      <section
        className="hidden md:flex flex-col justify-between p-margin-desktop relative overflow-hidden"
        style={{ backgroundColor: '#0a0a0b' }}
      >
        {/* Texture subtile en arrière-plan */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 80%, rgba(253,188,19,0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)
            `,
          }}
        />
        {/* Grille de points discrète */}
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(253,188,19,0.15)', border: '1px solid rgba(253,188,19,0.25)' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#fdbc13', fontVariationSettings: "'FILL' 1" }}>description</span>
            </div>
            <Link to="/" className="font-display-xl text-headline-md tracking-tight" style={{ color: '#ffffff' }}>DocMaster</Link>
          </div>

          {/* Accroche */}
          <div className="mt-24 max-w-md">
            <h2 className="font-headline-lg text-headline-lg leading-tight" style={{ color: '#ffffff' }}>
              L'art du document technique,{' '}
              <span className="italic font-serif" style={{ color: '#fdbc13' }}>parfaitement structuré.</span>
            </h2>
            <p className="mt-6 font-body-md leading-relaxed" style={{ color: '#a8a8b3' }}>
              Accédez à votre atelier de manipulation PDF. Protection, conversion et édition avec la précision de l'artisanat numérique.
            </p>
          </div>
        </div>

        {/* Badges techniques en bas */}
        <div className="relative z-10 flex gap-10 items-center">
          <div>
            <p className="font-label-bold uppercase tracking-widest text-xs mb-1.5" style={{ color: '#fdbc13' }}>Standard</p>
            <p className="font-body-md text-sm" style={{ color: '#e0e0e6' }}>ISO 32000-2</p>
          </div>
          <div>
            <p className="font-label-bold uppercase tracking-widest text-xs mb-1.5" style={{ color: '#fdbc13' }}>Sécurité</p>
            <p className="font-body-md text-sm" style={{ color: '#e0e0e6' }}>AES-256 GCM</p>
          </div>
          <div>
            <p className="font-label-bold uppercase tracking-widest text-xs mb-1.5" style={{ color: '#fdbc13' }}>Format</p>
            <p className="font-body-md text-sm" style={{ color: '#e0e0e6' }}>PDF 2.0</p>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface relative">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="md:hidden flex items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-secondary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            <Link to="/" className="font-display-xl text-headline-md text-primary">DocMaster</Link>
          </div>
          
          <div className="mb-12">
            <h3 className="font-headline-lg text-[32px] leading-tight text-primary">Content de vous revoir.</h3>
            <p className="mt-3 text-on-surface-variant font-body-md">Entrez vos accès pour gérer vos fichiers techniques.</p>
            <p className="mt-2 text-label-sm font-label-bold text-error/80 uppercase tracking-wide">
              * Champs obligatoires
            </p>
          </div>
          
          {(error || validationError) && (
            <div className="bg-error/10 text-error p-4 rounded-lg font-label-bold flex items-center gap-3 mb-8 animate-fade-in shadow-sm border border-error/20">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              {validationError || error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="relative group">
              <label className="block font-label-bold text-label-bold text-on-surface-variant mb-2 transition-colors group-focus-within:text-secondary" htmlFor="email">
                ADRESSE E-MAIL <span className="text-error">*</span>
              </label>
              <input 
                className="w-full py-4 input-underline font-body-md text-primary placeholder:text-outline-variant/60" 
                id="email" 
                name="email" 
                placeholder="nom@entreprise.com" 
                required 
                type="email" 
                autoComplete="username"
                onChange={() => { clearError(); setValidationError(null); }}
              />
            </div>
            
            {/* Password Input */}
            <div className="relative group">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label-bold text-label-bold text-on-surface-variant transition-colors group-focus-within:text-secondary" htmlFor="password">
                  MOT DE PASSE <span className="text-error">*</span>
                </label>
                <a className="font-label-bold text-label-sm text-secondary hover:text-secondary-fixed-dim transition-colors" href="#">
                  Oublié ?
                </a>
              </div>
              <div className="relative">
                <input 
                  className="w-full py-4 input-underline font-body-md text-primary placeholder:text-outline-variant/60" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"} 
                  onChange={() => { clearError(); setValidationError(null); }}
                />
                <button 
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary transition-colors" 
                  onClick={() => setShowPassword(!showPassword)} 
                  type="button"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4 space-y-4">
              <button 
                className="w-full bg-primary text-on-primary font-label-bold text-body-md py-5 rounded-none hover:bg-secondary-container hover:text-primary transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">sync</span>
                    <span>AUTHENTIFICATION...</span>
                  </>
                ) : (
                  <>
                    <span>SE CONNECTER À L'ATELIER</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/30"></div>
                </div>
                <div className="relative bg-surface px-4 text-label-sm font-label-bold text-on-surface-variant">
                  OU
                </div>
              </div>

              <a 
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`}
                className="w-full bg-surface-container-low text-primary border border-outline-variant font-label-bold text-body-md py-5 rounded-none hover:bg-surface-container-high transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {/* Icône Google basique */}
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                CONTINUER AVEC GOOGLE
              </a>
            </div>
          </form>
          
          {/* Footer Links */}
          <div className="mt-16 pt-8 border-t border-outline-variant/30 text-center md:text-left">
            <p className="font-body-md text-on-surface-variant">
              Nouveau sur DocMaster ? 
              <Link className="font-label-bold text-primary ml-2 underline decoration-secondary-container decoration-2 underline-offset-4 hover:decoration-primary transition-all" to="/register">
                Créer un compte professionnel
              </Link>
            </p>
          </div>
          <div className="mt-12 flex justify-center md:justify-start gap-6">
            <Link className="text-label-sm font-label-bold text-on-surface-variant hover:text-primary transition-colors" to="/privacy">CONFIDENTIALITÉ</Link>
            <Link className="text-label-sm font-label-bold text-on-surface-variant hover:text-primary transition-colors" to="/terms">CONDITIONS</Link>
            <Link className="text-label-sm font-label-bold text-on-surface-variant hover:text-primary transition-colors" to="/help">AIDE</Link>
          </div>
        </div>
      </section>
    </main>
  );
};
