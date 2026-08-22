import React, { useState } from 'react';

// Le backend (protect.js) impose : motDePasse.length >= 4
const MIN_LENGTH = 4;

const getStrength = (pwd) => {
  if (pwd.length === 0) return null;
  if (pwd.length < MIN_LENGTH) return { label: `Trop court (min. ${MIN_LENGTH} caractères)`, pct: 10, color: 'bg-error', textColor: 'text-error' };
  if (pwd.length < 8)  return { label: 'Acceptable — ajoutez des chiffres ou symboles', pct: 35, color: 'bg-orange-500', textColor: 'text-orange-500' };
  if (pwd.length < 12) return { label: 'Moyen — mieux avec majuscules & caractères spéciaux', pct: 65, color: 'bg-yellow-500', textColor: 'text-yellow-600' };
  if (pwd.length < 16) return { label: 'Fort', pct: 85, color: 'bg-green-400', textColor: 'text-green-600' };
  return { label: 'Très fort', pct: 100, color: 'bg-green-500', textColor: 'text-green-600' };
};

const TIPS = [
  'Minimum 4 caractères requis par le standard PDF.',
  'Combinez majuscules, minuscules, chiffres et symboles (!@#$) pour plus de sécurité.',
  'Un mot de passe de 12 caractères ou plus est recommandé pour des documents sensibles.',
];

export const ProtectOptions = ({ onStart, isProcessing }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);
  const passwordsMatch = confirm === '' || password === confirm;

  const handleSubmit = async () => {
    setFormError('');

    if (password.length < MIN_LENGTH) {
      setFormError(`Le mot de passe est trop court. Il faut au minimum ${MIN_LENGTH} caractères.`);
      return;
    }
    if (password !== confirm) {
      setFormError('Les mots de passe ne correspondent pas. Vérifiez votre saisie.');
      return;
    }

    setLoading(true);
    await onStart({ motDePasse: password });
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="font-display-xl text-title-md text-on-surface">Protection par mot de passe</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Définissez un mot de passe pour restreindre l'accès au document.
        </p>
      </div>

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">

        {/* Champ mot de passe */}
        <div className="space-y-2">
          <label className="text-label-md font-label-bold text-on-surface">
            Mot de passe
            <span className="ml-2 text-label-sm text-on-surface-variant font-normal">({MIN_LENGTH} caractères min.)</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
              disabled={isProcessing || loading}
              placeholder={`Saisissez un mot de passe (min. ${MIN_LENGTH} caractères)`}
              className="w-full px-4 py-3 pr-10 bg-surface-container rounded-xl border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all text-body-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Indicateur de force */}
          {strength && (
            <div className="space-y-1 mt-2">
              <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${strength.pct}%` }}
                />
              </div>
              <p className={`text-label-sm ${strength.textColor}`}>{strength.label}</p>
            </div>
          )}
        </div>

        {/* Confirmation */}
        <div className="space-y-2">
          <label className="text-label-md font-label-bold text-on-surface">Confirmer le mot de passe</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setFormError(''); }}
            disabled={isProcessing || loading}
            placeholder="Répétez exactement le même mot de passe"
            className={`w-full px-4 py-3 bg-surface-container rounded-xl border outline-none transition-all text-body-md ${
              !passwordsMatch
                ? 'border-error focus:border-error'
                : 'border-outline-variant focus:border-secondary'
            } focus:ring-1 ${!passwordsMatch ? 'focus:ring-error' : 'focus:ring-secondary'}`}
          />
          {!passwordsMatch && (
            <p className="text-label-sm text-error">⚠ Les mots de passe ne correspondent pas</p>
          )}
        </div>

        {/* Erreur générale */}
        {formError && (
          <div className="flex items-start gap-2 p-3 bg-error/10 rounded-xl border border-error/30">
            <span className="material-symbols-outlined text-[16px] text-error mt-0.5">error</span>
            <p className="text-body-sm text-error">{formError}</p>
          </div>
        )}

        {/* Conseils */}
        <div className="p-4 bg-surface-container rounded-xl space-y-2">
          <p className="text-label-sm font-label-bold text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">lightbulb</span>
            Conseils pour un bon mot de passe
          </p>
          <ul className="space-y-1">
            {TIPS.map((tip, i) => (
              <li key={i} className="text-body-xs text-on-surface-variant flex items-start gap-2">
                <span className="text-secondary mt-0.5 shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-6 border-t border-outline-variant bg-surface">
        <button
          onClick={handleSubmit}
          disabled={isProcessing || loading || password.length < MIN_LENGTH || !confirm || !passwordsMatch}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Lancement…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">lock</span>
              Protéger le fichier
            </>
          )}
        </button>
      </div>
    </div>
  );
};
