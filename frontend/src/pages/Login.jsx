import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginUser, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Nettoyer l'erreur quand le composant est monté
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await loginUser(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <main className="asymmetric-layout">
      {/* Left Side: Visual Anchor (Illustration) */}
      <section className="hidden md:flex flex-col justify-between p-margin-desktop bg-primary relative overflow-hidden">
        {/* Animated Background / Image */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-soft-light" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLt02XjLs9nFPw4ExnpP4mrgQDb2s6oUgvjjKJlsL6mcKP3QXulXoHYB5v-jeup0I9D95KLhQh3VSwwWi7k0w7adcp4ItzXe5l3I0GF9EgdIQkwr6HgdV4MacHBUnjTd7RuUgv-KtHeJMfIvu5XTsWmraz3yiRNb8kUQq2hdSIj2Oh93-ZxvQz5gZLERoOJIC-bPzsc-y_s3Bu8hxABrfrwHF6yo8hcDBp72iNJp7V25LBLUuLHtoRczvh7a')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            </div>
            <Link to="/" className="font-display-xl text-headline-md text-secondary-fixed-dim tracking-tight">DocMaster</Link>
          </div>
          <div className="mt-24 max-w-md">
            <h2 className="font-headline-lg text-headline-lg text-on-primary leading-tight">
              L'art du document technique, <br/><span className="text-secondary-fixed-dim italic font-serif">parfaitement structuré.</span>
            </h2>
            <p className="mt-8 text-on-primary-container font-body-md leading-relaxed">
              Accédez à votre atelier de manipulation PDF. Protection, conversion et édition avec la précision de l'artisanat numérique.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-12 items-center">
          <div className="text-on-primary-container">
            <p className="font-label-bold text-label-bold uppercase tracking-widest text-secondary-fixed-dim mb-2">Standard</p>
            <p className="font-body-md text-body-md">ISO 32000-2</p>
          </div>
          <div className="text-on-primary-container">
            <p className="font-label-bold text-label-bold uppercase tracking-widest text-secondary-fixed-dim mb-2">Sécurité</p>
            <p className="font-body-md text-body-md">AES-256 GCM</p>
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
            <h3 className="font-headline-lg text-headline-lg text-primary">Content de vous revoir.</h3>
            <p className="mt-3 text-on-surface-variant font-body-md">Entrez vos accès pour gérer vos fichiers techniques.</p>
            <p className="mt-2 text-label-sm font-label-bold text-error/80 uppercase tracking-wide">
              * Champs obligatoires
            </p>
          </div>
          
          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Affichage des erreurs globales */}
            {error && (
              <div className="bg-error/10 text-error p-4 rounded-lg font-label-bold flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

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
                onChange={clearError} // Nettoyer l'erreur à la saisie
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
                href="http://localhost:5001/api/auth/google"
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
            <Link className="text-label-sm font-label-bold text-on-surface-variant hover:text-primary transition-colors" to="/privacy">POLITIQUE</Link>
            <Link className="text-label-sm font-label-bold text-on-surface-variant hover:text-primary transition-colors" to="/support">SUPPORT</Link>
            <Link className="text-label-sm font-label-bold text-on-surface-variant hover:text-primary transition-colors" to="/api-docs">API</Link>
          </div>
        </div>
      </section>
    </main>
  );
};
