# Documentation Frontend : Bugs résolus — Session J1

Ce document recense l'ensemble des bugs identifiés et corrigés lors de la première journée de développement frontend, avec leur cause racine et la correction appliquée.

---

## Bug 1 — CORS bloquant le rafraîchissement de token

### Symptôme
```
Access to XMLHttpRequest at 'http://localhost:5001/api/auth/refresh' from origin
'http://localhost:5173' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Cause racine
Le frontend Vite tournait sur un port différent de celui configuré dans le backend. De plus, la politique CORS du backend (`server.js`) n'autorisait pas toujours correctement l'origine du frontend.

### Correction appliquée
1. Configuration de `vite.config.js` pour forcer le port `5173` (`server.port: 5173, server.strictPort: true`).
2. Vérification de la regex CORS backend : `/^https?:\/\/localhost(:\d+)?$/` accepte bien `http://localhost:5173`.
3. Ajout de `withCredentials: true` sur l'instance Axios et de `credentials: true` + `allowedHeaders: ['Content-Type', 'Authorization']` côté backend.

### Fichiers modifiés
- `frontend/vite.config.js`
- `backend/src/server.js` (vérification, pas de modification nécessaire)

---

## Bug 2 — Conflit de ports Vite (5173 vs 5174)

### Symptôme
Le terminal affichait `localhost:5174` mais le navigateur ouvrait `localhost:5173`, ou inversement. La connexion Google échouait car l'URL de callback était enregistrée sur un port fixe.

### Cause racine
Vite incrémente automatiquement le port si le port demandé est déjà occupé (une ancienne instance n'avait pas été tuée). L'utilisateur se retrouvait avec deux serveurs frontend sur deux ports différents.

### Correction appliquée
Ajout de `strictPort: true` dans `vite.config.js`. Désormais, si le port 5173 est déjà occupé, Vite plante au lieu de basculer silencieusement sur un autre port. Cela force l'utilisateur à tuer le processus orphelin.

### Fichier modifié
- `frontend/vite.config.js`

---

## Bug 3 — Rafraîchissement de page (F5) redirige vers /login

### Symptôme
Après connexion (email/mot de passe OU Google), un rafraîchissement de la page Dashboard renvoyait systématiquement vers `/login`.

### Cause racine
**Deux problèmes distincts contribuaient à ce bug :**

1. **Corps de requête `null` non valide en JSON** : Les fonctions `refreshApi()` et `logoutApi()` dans `authApi.js` passaient `null` comme deuxième argument à `axiosClient.post()`. Axios sérialisait ce `null` en la chaîne `"null"`, qui n'est pas un JSON valide pour le parser `body-parser` d'Express. Le backend renvoyait donc une erreur `400 Bad Request` avec `SyntaxError: Unexpected token 'n', "null" is not valid JSON`. L'intercepteur Axios interprétait cette erreur comme une session expirée et redirigeait vers `/login`.

2. **Fichier orphelin `Sidebar.jsx`** : Après la suppression de la Sidebar du layout, le fichier `Sidebar.jsx` contenait des imports vers `useAuthStore` avec un chemin relatif `../../../store/useAuthStore` qui n'était plus valide. Vite tentait de le recompiler à chaque hot-reload, générant des erreurs internes qui perturbaient le chargement du module `AppLayout.jsx`.

### Correction appliquée
1. Remplacement de `null` par `{}` (objet vide) dans `authApi.js` et dans l'intercepteur de `axiosClient.js`.
2. Suppression physique du fichier `Sidebar.jsx`.

### Fichiers modifiés
- `frontend/src/services/api/authApi.js` (`null` → `{}`)
- `frontend/src/services/api/axiosClient.js` (`null` → `{}`)
- `frontend/src/components/layout/Sidebar.jsx` (supprimé)

---

## Bug 4 — Google OAuth affiche l'email au lieu du nom complet

### Symptôme
Après connexion via Google, le Dashboard affichait l'adresse email de l'utilisateur (ex: `abdoulayema82@gmail.com`) au lieu de son nom complet (ex: `Abdoulaye Ma`).

### Cause racine
**Deux failles dans le pipeline :**

1. **Backend (`auth.service.js`)** : La fonction `generateTokens()` ne mettait pas le champ `nom_complet` dans le payload du JWT. Le frontend, en décodant le token, ne trouvait donc jamais ce champ.
2. **Backend (`passport.js`)** : Pour les utilisateurs Google existants (reconnexion), seule la `photo_url` était mise à jour en BDD. Le `nom_complet` provenant du profil Google n'était pas injecté dans l'objet `user`, ce qui faisait que `generateTokens(user)` recevait un objet avec un `nom_complet` potentiellement `null` ou obsolète.

### Correction appliquée
1. Ajout de `nom_complet: user.nom_complet` dans le payload JWT de `generateTokens()` et de `refreshTokenService()`.
2. Modification de la requête SQL dans `passport.js` pour mettre à jour à la fois `photo_url` ET `nom_complet` lors de chaque reconnexion Google, avec `RETURNING *` pour obtenir l'objet utilisateur frais.
3. Côté frontend (`useAuthStore.js`), fallback `nom_complet: payload.nom_complet || payload.email` pour gérer les anciens tokens.

### Fichiers modifiés
- `backend/src/services/auth.service.js` (payload JWT enrichi)
- `backend/src/config/passport.js` (UPDATE SQL étendu)
- `frontend/src/store/useAuthStore.js` (décodage du `nom_complet`)

---

## Bug 5 — Chevauchement "DocMaster" / "Créer un compte" sur la page Register (mobile)

### Symptôme
Sur les écrans étroits (< lg), le texte "DocMaster" et le titre "Créer un compte" se superposaient, rendant la page illisible.

### Cause racine
Le branding mobile de la page Register était positionné en `absolute top-8 left-8`, ce qui le sortait du flux du document. Le titre du formulaire, lui, suivait le flux normal et se retrouvait exactement au même emplacement visuel.

### Correction appliquée
Remplacement du positionnement `absolute` par un bloc **statique** dans le flux du document (`lg:hidden flex items-center gap-3 mb-12`), identique au pattern utilisé sur la page Login. Ajout de l'icône `description` pour la cohérence visuelle.

### Fichier modifié
- `frontend/src/pages/Register.jsx`

---

## Bug 6 — Transition "brute" après connexion Google

### Symptôme
Après la connexion via Google, le Dashboard apparaissait de manière abrupte, "comme si quelque chose voulait se passer mais qu'on l'avait interrompu". La connexion via email/mot de passe, elle, était fluide.

### Cause racine
Le composant `AuthCallback.jsx` naviguait vers `/dashboard` après seulement 100ms. Ce délai était trop court pour que l'animation de chargement ("Connexion sécurisée en cours...") soit perceptible par l'utilisateur. Le résultat était un "flash" visuel désagréable.

### Correction appliquée
Augmentation du délai de transition de 100ms à **1200ms** (1,2 seconde). L'utilisateur voit désormais clairement l'écran de transition avec l'animation `pulse` avant d'arriver sur le Dashboard.

### Fichier modifié
- `frontend/src/pages/AuthCallback.jsx`

---

## Résumé des corrections

| # | Bug | Sévérité | Fichiers impactés | Statut |
|---|-----|----------|-------------------|--------|
| 1 | CORS refresh token | 🔴 Bloquant | `vite.config.js` | ✅ Résolu |
| 2 | Conflit de ports Vite | 🟠 Majeur | `vite.config.js` | ✅ Résolu |
| 3 | F5 → /login | 🔴 Bloquant | `authApi.js`, `axiosClient.js`, `Sidebar.jsx` | ✅ Résolu |
| 4 | Email au lieu du nom (Google) | 🟡 Mineur UX | `auth.service.js`, `passport.js`, `useAuthStore.js` | ✅ Résolu |
| 5 | Chevauchement texte Register | 🟡 Mineur UX | `Register.jsx` | ✅ Résolu |
| 6 | Flash post-Google OAuth | 🟡 Mineur UX | `AuthCallback.jsx` | ✅ Résolu |
