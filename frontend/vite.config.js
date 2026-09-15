import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    // Désactiver le traitement automatique des dark modes par LightningCSS
    // LightningCSS injectait ses propres règles .dark { color-scheme } APRÈS nos variables
    // ce qui écrasait nos overrides de couleurs en mode sombre.
    lightningcss: false,
    transformer: 'postcss',
  },
});
