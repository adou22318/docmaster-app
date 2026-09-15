import { useState, useEffect } from 'react';

/**
 * Hook de gestion du thème (clair / sombre).
 *
 * Comportement :
 * - Par défaut : suit la préférence du système (prefers-color-scheme).
 *   C'est le standard UX recommandé (OS dark mode → app dark mode).
 * - Si l'utilisateur change manuellement → mémorisé en localStorage.
 * - Si l'utilisateur n'a jamais choisi → le thème reste synchronisé avec l'OS.
 * - L'OS peut changer en temps réel (ex: mode auto de l'iPhone) → suivi live.
 */
export function useTheme() {
  // Lecture initiale : préférence manuelle > préférence système
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('docmaster_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // Aucun choix manuel → suivre le système
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Appliquer la classe .dark sur <html> à chaque changement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // On NE sauvegarde PAS ici — on sauvegarde seulement lors d'un choix explicite
  }, [theme]);

  // Écouter les changements de préférence système en temps réel
  // Uniquement si l'utilisateur n'a pas fait de choix manuel
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const saved = localStorage.getItem('docmaster_theme');
      // Ignorer si l'utilisateur a fait un choix manuel
      if (saved === 'dark' || saved === 'light') return;
      setThemeState(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  /**
   * Bascule explicitement entre clair et sombre.
   * Sauvegarde le choix en localStorage pour le mémoriser.
   */
  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('docmaster_theme', next);
      return next;
    });
  };

  /**
   * Réinitialise au mode système (supprime le choix manuel).
   */
  const resetToSystem = () => {
    localStorage.removeItem('docmaster_theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeState(systemDark ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    resetToSystem,
    isDark: theme === 'dark',
    // true si l'utilisateur a fait un choix manuel (pas en mode auto)
    isManual: !!localStorage.getItem('docmaster_theme'),
  };
}
