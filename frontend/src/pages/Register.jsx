import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const Register = () => {
  const currentYear = new Date().getFullYear();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const { registerUser, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    setValidationError(null);
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fullName = e.target['full-name'].value.trim();
    const email = e.target.email.value.trim();
    const pass = e.target.password.value;
    const confirm = e.target['password-confirm'].value;
    setValidationError(null);

    if (!email) {
      setValidationError('Veuillez saisir votre adresse email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Adresse email invalide. Vérifiez le format (exemple : nom@domaine.com)');
      return;
    }

    if (fullName.length < 2) {
      setValidationError('Le nom complet doit faire au moins 2 caractères.');
      return;
    }

    if (pass.length < 8) {
      setValidationError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }

    if (pass !== confirm) {
      setValidationError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    const result = await registerUser(email, pass, fullName);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <main className="grid asymmetric-layout min-h-screen">
      {/* Left Side — Brand Panel (toujours sombre, indépendant du thème) */}
      <section
        className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden"
        style={{ backgroundColor: '#0a0a0b' }}
      >
        {/* Texture */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 85%, rgba(253,188,19,0.07) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.02) 0%, transparent 50%)
          `
        }} />
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Logo */}
        <div className="z-10">
          <Link to="/" className="font-display-xl text-headline-md leading-none" style={{ color: '#fdbc13' }}>DocMaster</Link>
          <p className="font-label-bold text-label-bold mt-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Édition Technique</p>
        </div>

        {/* Accroche + Bento cards */}
        <div className="z-10 space-y-8">
          <div className="max-w-md">
            <h2 className="font-headline-lg text-headline-lg leading-tight" style={{ color: '#ffffff' }}>
              L'art du document technique, <span style={{ color: '#fdbc13' }}>réinventé.</span>
            </h2>
            <p className="font-body-lg text-body-lg mt-6 leading-relaxed" style={{ color: '#a8a8b3' }}>
              Rejoignez l'atelier digital où la précision rencontre le design. Gérez, transformez et sécurisez vos fichiers avec élégance.
            </p>
          </div>

          {/* Bento */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <span className="material-symbols-outlined mb-4 block" style={{ color: '#fdbc13', fontVariationSettings: "'FILL' 1" }}>sync_alt</span>
              <h4 className="font-label-bold text-label-bold" style={{ color: '#e0e0e6' }}>Conversion</h4>
              <p className="text-xs mt-1" style={{ color: '#666' }}>PDF ↔ Images, Office</p>
            </div>
            <div className="p-6 rounded-xl border translate-y-8" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <span className="material-symbols-outlined mb-4 block" style={{ color: '#fdbc13', fontVariationSettings: "'FILL' 1" }}>lock</span>
              <h4 className="font-label-bold text-label-bold" style={{ color: '#e0e0e6' }}>Protection</h4>
              <p className="text-xs mt-1" style={{ color: '#666' }}>AES-256 GCM</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10">
          <p className="font-label-sm text-label-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>© {currentYear} PDF DocMaster. Tous droits réservés.</p>
        </div>
      </section>

      {/* Right Side: Registration Form Section */}
      <section className="flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface relative">
        <div className="w-full max-w-[480px]">
          {/* Mobile Branding — cohérent avec Login */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-secondary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            <Link to="/" className="font-display-xl text-headline-md text-primary">DocMaster</Link>
          </div>
          
          <header className="mb-12">
            <h3 className="font-headline-lg text-[32px] leading-tight text-primary">Créer un compte</h3>
            <p className="mt-3 text-on-surface-variant font-body-md">Remplissez les informations ci-dessous pour commencer.</p>
            <p className="mt-2 text-label-sm font-label-bold text-error/80 uppercase tracking-wide">
              * Champs obligatoires
            </p>
          </header>
          
          {(error || validationError) && (
            <div className="bg-error/10 text-error p-4 rounded-lg font-label-bold flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined">error</span>
              {validationError || error}
            </div>
          )}

          <form className="space-y-10" onSubmit={handleSubmit}>
            <div className="group">
              <label className="block font-label-bold text-label-bold text-on-surface-variant mb-2 uppercase tracking-wide transition-colors group-focus-within:text-secondary" htmlFor="full-name">NOM COMPLET <span className="text-error">*</span></label>
              <input className="w-full py-4 input-underline font-body-md text-primary placeholder:text-outline-variant/60" id="full-name" name="full-name" placeholder="Adou KOITA" required type="text" onChange={() => { clearError(); setValidationError(null); }} />
            </div>
            
            <div className="group">
              <label className="block font-label-bold text-label-bold text-on-surface-variant mb-2 uppercase tracking-wide transition-colors group-focus-within:text-secondary" htmlFor="email">ADRESSE E-MAIL <span className="text-error">*</span></label>
              <input className="w-full py-4 input-underline font-body-md text-primary placeholder:text-outline-variant/60" id="email" name="email" placeholder="nom@entreprise.com" required autoComplete="username" type="email" onChange={() => { clearError(); setValidationError(null); }} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block font-label-bold text-label-bold text-on-surface-variant mb-2 uppercase tracking-wide transition-colors group-focus-within:text-secondary" htmlFor="password">MOT DE PASSE <span className="text-error">*</span></label>
                <input className="w-full py-4 input-underline font-body-md text-primary placeholder:text-outline-variant/60" id="password" name="password" placeholder="••••••••" required autoComplete="new-password" type="password" onChange={() => { clearError(); setValidationError(null); }} />
              </div>
              <div className="group">
                <label className="block font-label-bold text-label-bold text-on-surface-variant mb-2 uppercase tracking-wide transition-colors group-focus-within:text-secondary" htmlFor="password-confirm">CONFIRMATION <span className="text-error">*</span></label>
                <input className="w-full py-4 input-underline font-body-md text-primary placeholder:text-outline-variant/60" id="password-confirm" name="password-confirm" placeholder="••••••••" required autoComplete="new-password" type="password" onChange={() => { clearError(); setValidationError(null); }} />
              </div>
            </div>
            
            <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
              En créant votre compte, vous acceptez nos <Link className="text-primary font-bold underline decoration-2 underline-offset-4 hover:text-secondary-fixed-dim transition-colors" to="/terms">Conditions d'Utilisation</Link> et notre <Link className="text-primary font-bold underline decoration-2 underline-offset-4 hover:text-secondary-fixed-dim transition-colors" to="/privacy">Politique de Confidentialité</Link>.
            </p>
            
            <div className="pt-4 space-y-4">
              <button 
                className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-5 rounded-none hover:bg-secondary-container hover:text-on-secondary-container transition-all duration-300 active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-50" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">sync</span>
                    <span>CRÉATION EN COURS...</span>
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
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
          
          <footer className="mt-12 text-center">
            <p className="font-body-md text-on-surface-variant">
              Déjà un compte ? 
              <Link className="text-primary font-bold hover:text-secondary-fixed-dim transition-colors ml-1" to="/login">Connectez-vous</Link>
            </p>
          </footer>
        </div>
        
        <div className="absolute bottom-0 right-0 p-8 opacity-5">
          <span className="material-symbols-outlined text-[120px] select-none" style={{ fontVariationSettings: "'wght' 100" }}>history_edu</span>
        </div>
      </section>
    </main>
  );
};
