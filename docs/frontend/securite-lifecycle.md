# Documentation — Sécurité, Authentification et Cycle de Vie des Fichiers

**Semaine :** S1-S5 (fondations + renforcements)  
**Statut :** ✅ En production locale

---

## 1. Authentification JWT en mémoire

### Principe

Les tokens JWT ne sont **jamais** stockés dans `localStorage` ou `sessionStorage` — seul le store Zustand (`useAuthStore.js`) en mémoire vive les conserve. En cas de rechargement de page, le token est perdu et l'utilisateur doit se reconnecter.

### Tokens

| Token         | Durée de vie | Stockage       |
|---------------|--------------|----------------|
| Access token  | 15 minutes   | Mémoire Zustand |
| Refresh token | 7 jours      | Cookie HttpOnly (optionnel) |

### Renouvellement automatique

`axiosClient.js` intercepte les réponses `401` et tente automatiquement un renouvellement via `POST /api/auth/refresh` avant de rejouer la requête originale. Si le refresh échoue, l'utilisateur est déconnecté.

---

## 2. OAuth Google (Passport.js)

- Stratégie : `passport-google-oauth20`
- Flux : redirection vers Google → callback → création/mise à jour du compte → JWT émis
- Les comptes OAuth n'ont pas de mot de passe stocké dans la BDD
- Message d'erreur login intentionnellement vague : _"Email ou mot de passe incorrect"_ (y compris pour les comptes OAuth, pour ne pas révéler le mode d'authentification)

---

## 3. Sécurité générale du backend

| Mécanisme | Implémentation | Détail |
|-----------|---------------|--------|
| Hachage mot de passe | `bcrypt` | salt rounds = 12 |
| En-têtes HTTP | `Helmet.js` | CSP, HSTS, X-Frame-Options… |
| Rate limiting | `express-rate-limit` | Routes `/auth/*` et `/payment/*` |
| CORS | `cors` npm | Origines autorisées : localhost:5173 + domaine prod |
| Validation entrées | `Joi` | Toutes les routes de création (jobs, auth, paiement) |
| Vérification propriétaire | BDD | Chaque accès à un fichier vérifie `owner_id = req.user.id` |

---

## 4. Cycle de vie des fichiers

### Principe Privacy-First

Les fichiers ne sont **jamais** supprimés automatiquement après téléchargement. La suppression est toujours une action **explicite** de l'utilisateur ou liée à la déconnexion.

### Déclencheurs de suppression

| Déclencheur | Action | Endpoint |
|-------------|--------|----------|
| Annulation d'import | L'utilisateur clique "Changer de fichier" | `DELETE /api/files/:id` |
| Suppression manuelle | Depuis "Fichiers récents" ou "Mes fichiers" | `DELETE /api/files/:id` |
| Déconnexion | Modale de confirmation avant logout | `DELETE /api/files/all` |
| Erreur à l'upload | Nettoyage d'urgence côté serveur | Automatique (pas d'API) |

### Modale de déconnexion (`LogoutConfirmModal.jsx`)

Avant de finaliser la déconnexion, l'utilisateur voit un avertissement :  
> _"Tous vos fichiers stockés sur le serveur seront supprimés définitivement. Cette action est irréversible."_

Il doit confirmer explicitement. À la confirmation : `DELETE /api/files/all` → purge disque + BDD → révocation JWT.

### Chemins de fichiers

Les chemins absolus sur le disque ne sont jamais exposés au frontend. Seul `resultat_url` (UUID de fichier dans l'URL) est transmis. La résolution chemin↔UUID est faite exclusivement côté backend.

---

## 5. Validation des formats à l'upload

### Middleware `uploads.js`

Le middleware Multer filtre les fichiers selon l'outil actif (paramètre `?tool=` dans la query) :

| Outil                   | Formats acceptés |
|-------------------------|-----------------|
| PDF (tous outils)       | `application/pdf` |
| `convert_to_pdf`        | .docx, .xlsx, .pptx, .odt, .ods, .odp |
| `convert_images_to_pdf` | .jpg, .jpeg, .png, .bmp, .gif, .tiff |
| `add_image`, `sign`     | .jpg, .jpeg, .png |

### Composant `FileFormatError.jsx` (S5)

Quand un utilisateur uploade un fichier incompatible, ce composant affiche :
- Le message d'erreur ciblé (format reçu vs formats attendus)
- Un bouton de redirection vers l'outil approprié (ex: upload d'un `.docx` sur un outil PDF → proposition de redirection vers "Office → PDF")

---

## 6. Thème sombre / clair

- Géré par `useTheme.js` (hook custom)
- Préférence persistée en `localStorage` (clé `theme`)
- Application via classe CSS `dark` sur `<html>`
- Pas de données personnelles impliquées → pas de risque RGPD
