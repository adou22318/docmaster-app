# Authentification — DocMaster

**Date :** 2026-06-23  
**Semaine :** S1  
**Statut :** ✅ Complet

---

## Vue d'ensemble

Système d'authentification JWT avec refresh tokens et OAuth Google.  
Le module gère l'inscription, la connexion, le rafraîchissement de tokens,
la déconnexion et l'authentification via Google OAuth 2.0.

### Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Runtime | Node.js | — |
| Framework | Express | 5.2.1 |
| Base de données | PostgreSQL | 16 |
| Hashage | bcrypt | 6.0.0 |
| JWT | jsonwebtoken | 9.0.3 |
| OAuth | passport + passport-google-oauth20 | 0.7.0 / 2.0.0 |

---

## Architecture des fichiers

```
backend/src/
├── config/
│   ├── db.js                # Pool de connexion PostgreSQL (pg)
│   └── passport.js          # Stratégie Google OAuth 2.0
├── controllers/
│   └── auth.controller.js   # Validation des entrées + réponses HTTP
├── middlewares/
│   ├── verifyToken.js       # Middleware de vérification access token
│   └── errorHandler.js      # Gestion centralisée des erreurs
├── routes/
│   └── auth.routes.js       # Définition des routes /api/auth/*
├── services/
│   └── auth.service.js      # Logique métier (register, login, refresh, logout)
└── server.js                # Point d'entrée Express
```

---

## Schéma de base de données

### Table `users`

| Colonne | Type | Description |
|---------|------|-------------|
| `id_users` | SERIAL PRIMARY KEY | Identifiant unique |
| `email` | VARCHAR UNIQUE | Adresse email |
| `mot_de_passe` | VARCHAR NULL | Hash bcrypt (NULL pour les comptes OAuth) |
| `nom_complet` | VARCHAR | Nom complet de l'utilisateur |
| `plan` | VARCHAR | Plan de l'utilisateur |
| `photo_url` | VARCHAR NULL | URL de la photo de profil (Google) |
| `oauth_provider` | VARCHAR NULL | Fournisseur OAuth (`'google'` ou NULL) |
| `created_at` | TIMESTAMP | Date de création |

### Table `refresh_tokens`

| Colonne | Type | Description |
|---------|------|-------------|
| `id_refresh_tokens` | SERIAL PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER FK → users | Référence vers l'utilisateur |
| `token` | TEXT | Le refresh token JWT |
| `revoked` | BOOLEAN DEFAULT FALSE | Indique si le token a été révoqué |
| `expires_at` | TIMESTAMP | Date d'expiration (NOW() + 7 jours) |

---

## Endpoints

> **Base URL :** `/api/auth`  
> Toutes les réponses suivent le format : `{ success: boolean, message?: string, data?: object }`

---

### POST /api/auth/register

Crée un nouveau compte utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "mot_de_passe": "minimum8chars",
  "nom_complet": "Jean Dupont"
}
```

**Validations :**
- Tous les champs sont obligatoires
- `mot_de_passe` : minimum 8 caractères
- `email` : doit être unique en BDD

**Succès (201) :**
```json
{
  "success": true,
  "message": "Compte créé avec succès.",
  "data": {
    "id_users": 1,
    "email": "user@example.com",
    "nom_complet": "Jean Dupont",
    "plan": "free",
    "created_at": "2026-06-23T15:00:00.000Z"
  }
}
```

**Erreurs :**

| Code | Condition | Message |
|------|-----------|---------|
| 400 | Champs manquants | `"Email, mot de passe et nom complet sont requis."` |
| 400 | Mot de passe < 8 chars | `"Le mot de passe doit comporter au moins 8 caractères."` |
| 409 | Email déjà utilisé | `"Cette adresse email est déjà utilisée."` |
| 500 | Erreur serveur | `"Une erreur interne est survenue."` |

---

### POST /api/auth/login

Authentifie un utilisateur et retourne une paire de tokens.

**Body :**
```json
{
  "email": "user@example.com",
  "mot_de_passe": "monmotdepasse"
}
```

**Validations :**
- `email` et `mot_de_passe` sont obligatoires
- Détecte les comptes OAuth (pas de mot de passe en BDD)

**Succès (200) :**
```json
{
  "success": true,
  "message": "Connexion réussie.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nom_complet": "Jean Dupont",
      "plan": "free",
      "photo_url": null
    }
  }
}
```

**Erreurs :**

| Code | Condition | Message |
|------|-----------|---------|
| 400 | Champs manquants | `"Email et mot de passe sont requis."` |
| 400 | Compte OAuth | `"Ce compte utilise la connexion Google. Utilisez le bouton \"Connexion avec Google\"."` |
| 401 | Email ou mot de passe invalide | `"Email ou mot de passe incorrect."` |
| 500 | Erreur serveur | `"Une erreur interne est survenue."` |

> **Note sécurité :** Le message `401` est volontairement identique pour email inconnu et mauvais mot de passe. Cela empêche l'énumération des comptes.

---

### POST /api/auth/refresh

Génère un nouvel access token à partir d'un refresh token valide.

**Header :**
```
Authorization: Bearer <refresh_token>
```

**Validations :**
1. Le refresh token doit être présent dans le header
2. La signature JWT doit être valide (`JWT_REFRESH_SECRET`)
3. Le token doit exister en BDD, ne pas être révoqué, et ne pas être expiré
4. L'utilisateur associé doit toujours exister

**Succès (200) :**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

> **Note :** Seul un nouvel access token est généré. Le refresh token existant reste valide jusqu'à son expiration ou révocation.

**Erreurs :**

| Code | Condition | Message |
|------|-----------|---------|
| 400 | Header manquant | `"Refresh token manquant."` |
| 401 | Token invalide, révoqué, expiré ou utilisateur supprimé | `"Session expirée. Veuillez vous reconnecter."` |

---

### POST /api/auth/logout

Révoque le refresh token pour empêcher toute réutilisation.

**Header :**
```
Authorization: Bearer <refresh_token>
```

**Succès (200) :**
```json
{
  "success": true,
  "message": "Déconnexion réussie."
}
```

> **Note :** Retourne toujours `200` même si le token est inconnu ou déjà révoqué. L'utilisateur est considéré "déconnecté" dans tous les cas côté client.

**Erreurs :**

| Code | Condition | Message |
|------|-----------|---------|
| 400 | Header manquant | `"Refresh token manquant."` |

---

### GET /api/auth/google

Initie le flux OAuth 2.0 Google. Redirige le navigateur vers la page de sélection de compte Google.

**Scopes demandés :** `profile`, `email`  
**Session :** désactivée (`session: false`)

**Comportement :** Redirige (302) vers `accounts.google.com`

---

### GET /api/auth/google/callback

Callback appelé par Google après autorisation. Traite le profil Google et retourne les tokens DocMaster.

**Comportement selon le résultat :**

**Succès — Nouveau compte :**
- Crée un utilisateur avec `oauth_provider = 'google'` et `mot_de_passe = NULL`
- Stocke la photo de profil Google
- Génère et stocke les tokens

**Succès — Compte existant :**
- Met à jour la `photo_url` avec la photo Google actuelle
- Génère et stocke les tokens

**Réponse (200) :**
```json
{
  "success": true,
  "message": "OAuth Google fonctionnel",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

> **TODO :** En production, remplacer la réponse JSON par une redirection vers le frontend :
> ```
> GET {FRONTEND_URL}/auth/callback?access_token=...&refresh_token=...
> ```

**Échec :** Redirige vers `GET /api/auth/google/failure`

---

### GET /api/auth/google/failure

Endpoint de fallback quand l'authentification Google échoue.

**Réponse (401) :**
```json
{
  "success": false,
  "message": "Connexion Google échouée."
}
```

---

## Middleware `verifyToken`

Middleware qui protège les routes nécessitant une authentification.
Vérifie le access token JWT dans le header `Authorization`.

**Utilisation :**
```js
import verifyToken from '../middlewares/verifyToken.js';

router.get('/protected-route', verifyToken, handler);
```

**Header attendu :**
```
Authorization: Bearer <access_token>
```

**Si valide :** Attache le payload décodé à `req.user` et passe au handler suivant.

**Payload `req.user` :**
```json
{
  "id": 1,
  "email": "user@example.com",
  "plan": "free",
  "iat": 1719151200,
  "exp": 1719152100
}
```

**Erreurs :**

| Code | Condition | `code` retourné | Message |
|------|-----------|-----------------|---------|
| 401 | Header manquant | — | `"Accès refusé. Token manquant."` |
| 401 | Format invalide | — | `"Format de token invalide. Utilisez: Bearer <token>"` |
| 401 | Token expiré | `TOKEN_EXPIRED` | `"Token expiré. Veuillez vous reconnecter."` |
| 401 | Token invalide/falsifié | `TOKEN_INVALID` | `"Token invalide."` |

> **Routes protégées existantes :**
> - `GET /api/health/protected` — Route de test du middleware (retourne `req.user`)

---

## Structure des tokens JWT

### Access Token

| Propriété | Valeur |
|-----------|--------|
| Secret | `JWT_SECRET` |
| Durée de vie | 15 minutes |
| Algorithme | HS256 (défaut jsonwebtoken) |

**Payload :**
```json
{
  "id": "<id_users>",
  "email": "<email>",
  "plan": "<plan>"
}
```

### Refresh Token

| Propriété | Valeur |
|-----------|--------|
| Secret | `JWT_REFRESH_SECRET` |
| Durée de vie | 7 jours |
| Algorithme | HS256 (défaut jsonwebtoken) |
| Stockage | Table `refresh_tokens` en BDD |

**Payload :**
```json
{
  "id": "<id_users>"
}
```

> Le refresh token contient un payload minimal (uniquement `id`) pour réduire la surface d'attaque.

---

## Flux d'authentification

### Flux classique (email/mot de passe)

```
┌──────────┐       POST /register        ┌──────────┐       INSERT        ┌──────────┐
│  Client  │ ──────────────────────────→  │  Server  │ ─────────────────→  │   BDD    │
│          │ ←────────────────────────── │          │ ←───────────────── │          │
│          │       201 { user }          │          │    user créé       │          │
└──────────┘                              └──────────┘                    └──────────┘

┌──────────┐       POST /login           ┌──────────┐  bcrypt.compare    ┌──────────┐
│  Client  │ ──────────────────────────→  │  Server  │ ─────────────────→  │   BDD    │
│          │ ←────────────────────────── │          │ ←───────────────── │          │
│          │  200 { accessToken,         │          │  user + hash       │          │
│          │    refreshToken, user }     │          │  store refresh     │          │
└──────────┘                              └──────────┘    token           └──────────┘

┌──────────┐     POST /refresh           ┌──────────┐  verify + lookup   ┌──────────┐
│  Client  │ ──────────────────────────→  │  Server  │ ─────────────────→  │   BDD    │
│  (auto)  │ ←────────────────────────── │          │ ←───────────────── │          │
│          │  200 { accessToken }        │          │  token valid       │          │
└──────────┘                              └──────────┘                    └──────────┘

┌──────────┐     POST /logout            ┌──────────┐   revoked=TRUE     ┌──────────┐
│  Client  │ ──────────────────────────→  │  Server  │ ─────────────────→  │   BDD    │
│          │ ←────────────────────────── │          │ ←───────────────── │          │
│          │  200 { message }            │          │                    │          │
└──────────┘                              └──────────┘                    └──────────┘
```

### Flux OAuth Google

```
┌──────────┐     GET /google             ┌──────────┐                    ┌──────────┐
│  Client  │ ──────────────────────────→  │  Server  │                    │  Google  │
│          │ ←──── 302 Redirect ──────── │ Passport │ ─────────────────→  │  OAuth   │
│          │ ──── Login Google ────────────────────────────────────────→  │          │
│          │ ←──── Redirect callback ──────────────────────────────────  │          │
│          │                              │          │ ←── profile ─────  │          │
│          │                              │          │                    └──────────┘
│          │                              │          │  upsert user       ┌──────────┐
│          │                              │          │ ─────────────────→  │   BDD    │
│          │ ←── 200 { tokens } ──────── │          │ ←───────────────── │          │
└──────────┘                              └──────────┘  store refresh     └──────────┘
```

---

## Choix techniques

### Hashage : bcrypt cost factor 12

Équilibre sécurité/performance. Environ 300ms par hash sur un PC standard — assez lent
pour décourager les attaques par force brute, assez rapide pour ne pas dégrader l'UX.

### Access token : durée de 15 minutes

Courte durée pour limiter les risques si un token est intercepté.
Le client doit appeler `/refresh` avant expiration pour maintenir la session.

### Refresh token : 7 jours en BDD

Stocker le refresh token en base de données (table `refresh_tokens`) permet la
révocation immédiate au logout, ce qui est impossible avec un JWT pur côté client.

### Message d'erreur unique pour login

`"Email ou mot de passe incorrect"` — ne révèle pas si l'email existe en base.
Empêche l'énumération des comptes par un attaquant.

### Logout toujours 200

Le endpoint `/logout` retourne toujours `200` même si le token est inconnu.
L'utilisateur est "déconnecté" côté client dans tous les cas — inutile de
signaler une erreur qui pourrait être exploitée.

### Comptes OAuth sans mot de passe

Les comptes créés via Google OAuth ont `mot_de_passe = NULL`.
Si l'utilisateur tente un login classique, le serveur retourne une erreur
spécifique (`400 OAUTH_ACCOUNT`) l'invitant à utiliser Google.

---

## Variables d'environnement requises

### Serveur

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur Express | `5001` |
| `FRONTEND_URL` | URL du frontend (pour CORS et redirections OAuth) | `http://localhost:5173` |

### Base de données PostgreSQL

| Variable | Description | Exemple |
|----------|-------------|---------|
| `HOST` | Hôte PostgreSQL | `localhost` |
| `USER` | Utilisateur PostgreSQL | `postgres` |
| `PASSWORD` | Mot de passe PostgreSQL | `Maestro&223` |
| `DATABASE` | Nom de la base | `docmaster-app` |
| `DBPORT` | Port PostgreSQL | `5434` |

### JWT

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Clé secrète pour signer les access tokens |
| `JWT_REFRESH_SECRET` | Clé secrète pour signer les refresh tokens |

> **⚠️ Important :** Ces secrets doivent être des chaînes longues, aléatoires et différentes l'une de l'autre. Ne jamais les committer dans le dépôt Git.

### Google OAuth 2.0

| Variable | Description | Exemple |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Client ID de la Google Cloud Console | `104...r7r.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret | `GOCSPX-...` |
| `GOOGLE_CALLBACK_URL` | URL de callback enregistrée dans Google | `http://localhost:5001/api/auth/google/callback` |

### Exemple `.env`

```env
PORT=5001
HOST=localhost
USER=postgres
PASSWORD=change_me
DATABASE=docmaster-app
DBPORT=5434
FRONTEND_URL=http://localhost:5173
JWT_SECRET=une_chaine_tres_longue_et_aleatoire
JWT_REFRESH_SECRET=une_autre_chaine_tres_longue_et_aleatoire
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

---

## Infrastructure (Docker)

Le projet utilise Docker Compose pour les services de données :

| Service | Image | Port exposé | Volume |
|---------|-------|-------------|--------|
| PostgreSQL | `postgres:16` | `5434:5432` | `postgres_data` |
| Redis | `redis:7-alpine` | `6379:6379` | `redis_data` |

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services (les données persistent)
docker-compose down

# Arrêter et supprimer les données
docker-compose down -v
```

---

## Dépendances npm liées à l'authentification

| Package | Version | Rôle |
|---------|---------|------|
| `bcrypt` | ^6.0.0 | Hashage des mots de passe |
| `jsonwebtoken` | ^9.0.3 | Génération et vérification des JWT |
| `passport` | ^0.7.0 | Framework d'authentification |
| `passport-google-oauth20` | ^2.0.0 | Stratégie OAuth Google |
| `pg` | ^8.21.0 | Client PostgreSQL |
| `dotenv` | ^17.4.2 | Chargement des variables d'environnement |

---

## Routes utilitaires liées à l'auth

| Route | Méthode | Protégée | Description |
|-------|---------|----------|-------------|
| `/` | GET | Non | Test de connexion BDD (retourne le nom de la base) |
| `/api/health` | GET | Non | Santé du serveur (retourne `{ status: 'ok' }`) |
| `/api/health/protected` | GET | Oui (`verifyToken`) | Test du middleware d'authentification |

---

## Sécurité — Bonnes pratiques implémentées

| Pratique | Détail |
|----------|--------|
| ✅ Hashage bcrypt (cost 12) | Mots de passe jamais stockés en clair |
| ✅ Tokens séparés (access/refresh) | Limiter l'exposition en cas d'interception |
| ✅ Refresh token en BDD | Permet la révocation (logout réel) |
| ✅ Messages d'erreur vagues | Pas d'énumération de comptes |
| ✅ Payload JWT minimal | Le refresh token ne contient que l'`id` |
| ✅ Access token courte durée | 15 minutes — réduit la fenêtre d'attaque |
| ✅ Détection comptes OAuth | Empêche le login par mot de passe sur un compte Google |
| ⚠️ CORS ouvert (`cors()`) | À configurer en production avec une whitelist d'origines |
| ⚠️ Helmet installé mais non activé | Le package `helmet` est dans les dépendances mais pas utilisé dans `server.js` |
| ⚠️ Validation basique | Pas de validation de format email (considérer l'ajout de `joi`) |
