# Documentation Technique Complète — PDF DocMaster
**Auteur : Abdoulaye MAÏGA**  
**Établissement : ENI-ABT (École Nationale d'Ingénieurs Abderhamane Baba Touré)**  
**Filière : Génie Informatique et Télécommunications (G.I.T)**  
**Entreprise d'accueil : Mali Développeur Sarl**  
**Licence Pro G.I.T — Soutenance 2025-2026**

---

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture générale](#2-architecture-générale)
3. [Stack technologique complète](#3-stack-technologique-complète)
4. [Structure du projet](#4-structure-du-projet)
5. [Backend — Détail technique](#5-backend--détail-technique)
   - 5.1 Serveur Express
   - 5.2 Base de données PostgreSQL
   - 5.3 Authentification & Sécurité
   - 5.4 Gestion des fichiers
   - 5.5 Système de jobs asynchrones (Bull + Redis)
   - 5.6 Services PDF (détail de chaque outil)
   - 5.7 Nettoyage automatique
6. [Frontend — Détail technique](#6-frontend--détail-technique)
   - 6.1 Routing SPA
   - 6.2 Gestion d'état (Zustand)
   - 6.3 Client HTTP (Axios)
   - 6.4 Système de notifications Toast
   - 6.5 Architecture de l'atelier de traitement
   - 6.6 Composants clés
7. [Flux de traitement complet (end-to-end)](#7-flux-de-traitement-complet-end-to-end)
8. [Sécurité](#8-sécurité)
9. [Bibliothèques et justifications des choix](#9-bibliothèques-et-justifications-des-choix)
10. [Variables d'environnement](#10-variables-denvironnement)
11. [Commandes de lancement](#11-commandes-de-lancement)
12. [Limites connues et points d'attention](#12-limites-connues-et-points-dattention)

---

## 1. Vue d'ensemble du projet

**PDF DocMaster** est une application web SaaS (Software as a Service) de gestion de documents PDF, développée dans le cadre d'un projet de licence. Elle permet aux utilisateurs authentifiés de réaliser des opérations courantes sur des fichiers PDF directement depuis leur navigateur, sans installation de logiciel.

### Fonctionnalités implémentées

| Catégorie | Outil | Opération backend |
|---|---|---|
| **Conversion** | Office → PDF (DOCX, XLSX, PPTX) | `convert_to_pdf` |
| **Conversion** | PDF → Images (PNG/JPG) | `pdf_to_images` |
| **Conversion** | Images → PDF | `convert_images_to_pdf` |
| **Conversion** | PDF → Texte brut | `pdf_to_txt` |
| **Organisation** | Fusionner des PDF | `merge` |
| **Organisation** | Diviser un PDF | `split` |
| **Organisation** | Rotation de pages | `rotate` |
| **Organisation** | Supprimer des pages | `remove_pages` |
| **Organisation** | Ajouter pages vierges | `add_blank_pages` |
| **Sécurité** | Protection par mot de passe | `protect` |
| **Sécurité** | Suppression de protection | `unprotect` |
| **Enrichissement** | Filigrane texte | `watermark` |
| **Enrichissement** | Incruster une image | `add_image` |
| **Enrichissement** | Extraction d'images | `extract_images` |
| **Signature** | Signature électronique simple | `sign` |
| **Métadonnées** | Nettoyage de métadonnées | `clean_metadata` |

### Modèle de rétention des fichiers

Tous les fichiers sont **temporaires** : ils expirent et sont supprimés automatiquement **24 heures** après leur upload ou leur génération.

---

## 2. Architecture générale

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR CLIENT                         │
│   React 18 + Vite + Tailwind CSS (port 5173 en dev)             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│   │ Zustand  │  │  Axios   │  │ React    │  │  pdf.js      │   │
│   │  Stores  │  │ Client   │  │ Router   │  │  (visionneur)│   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP REST (JSON + JWT Bearer)
                            │ port 5001
┌───────────────────────────▼─────────────────────────────────────┐
│                     BACKEND Node.js + Express                    │
│   ┌──────────────┐  ┌───────────────┐  ┌─────────────────────┐  │
│   │  Auth Routes │  │  Files Routes │  │   Jobs Routes       │  │
│   │  /api/auth   │  │  /api/files   │  │   /api/jobs         │  │
│   └──────────────┘  └───────────────┘  └─────────────────────┘  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Middleware verifyToken (JWT)                │   │
│   └─────────────────────────────────────────────────────────┘   │
│   ┌──────────────────────────────┐   ┌───────────────────────┐  │
│   │   Bull Queue (Redis)         │   │  Services PDF         │  │
│   │   pdf-processing queue       │◄──│  merge, split,        │  │
│   └──────────────────────────────┘   │  compress, sign, ...  │  │
│                                      └───────────────────────┘  │
└──────────┬────────────────────────────────────────────────────┘
           │
┌──────────▼──────────┐   ┌──────────────────┐   ┌─────────────┐
│   PostgreSQL         │   │   Redis           │   │  Disque     │
│   (données & meta)   │   │   (Bull Queue)    │   │  (fichiers) │
└─────────────────────┘   └──────────────────┘   └─────────────┘

Processus séparé :
┌─────────────────────────────────────────────────────────────────┐
│   Bull Worker (npm run worker) — pdfWorker.js                   │
│   Écoute la queue Redis, exécute les traitements PDF            │
│   Utilise : pdf-lib, Ghostscript, qpdf, LibreOffice, archiver   │
└─────────────────────────────────────────────────────────────────┘
```

**Point clé d'architecture** : Le serveur Express et le Worker Bull tournent dans **deux processus Node.js séparés**. Le serveur enfile les jobs dans Redis ; le Worker les dépile et les exécute. Cela permet de ne pas bloquer l'API pendant un traitement lourd.

---

## 3. Stack technologique complète

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| **Node.js** | v22.1 | Runtime JavaScript côté serveur |
| **Express.js** | ^4.x | Framework HTTP REST |
| **PostgreSQL** | 15+ | Base de données relationnelle |
| **Redis** | 7.x | Broker de messages pour Bull |
| **Bull** | ^4.x | Système de file d'attente de jobs asynchrones |
| **bcrypt** | ^5.x | Hachage des mots de passe (coût 12) |
| **jsonwebtoken** | ^9.x | Génération et vérification des JWT |
| **passport** | ^0.7.x | Middleware d'authentification |
| **passport-google-oauth20** | ^2.x | Stratégie OAuth 2.0 Google |
| **multer** | ^1.x | Upload de fichiers multipart/form-data |
| **express-rate-limit** | ^7.x | Protection contre les abus (rate limiting) |
| **dotenv** | ^16.x | Gestion des variables d'environnement |
| **uuid** | ^9.x | Génération d'UUIDs (noms de fichiers uniques) |
| **pdf-lib** | ^1.17.x | Manipulation PDF pure JavaScript |
| **pdf-parse** | v2.x | Extraction de texte depuis PDF |
| **archiver** | ^7.x | Création d'archives ZIP |
| **Ghostscript** | 10.x (système) | Compression PDF, rasterisation (PDF→images) |
| **qpdf** | 11.x (système) | Chiffrement/déchiffrement AES-256 |
| **LibreOffice** | 7.x (système) | Conversion Office → PDF (headless) |

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| **React** | 18.x | Bibliothèque UI |
| **Vite** | 8.x | Bundler et serveur de développement |
| **Tailwind CSS** | 3.x | Framework CSS utilitaire |
| **React Router DOM** | ^6.x | Routing SPA côté client |
| **Zustand** | ^4.x | Gestion d'état global (stores) |
| **Axios** | ^1.x | Client HTTP avec intercepteurs |
| **@hello-pangea/dnd** | ^16.x | Drag & Drop (réorganisation de fichiers) |
| **pdf.js** | 4.x (via CDN) | Rendu de pages PDF dans le navigateur |
| **Google Material Symbols** | (CDN) | Icônes |
| **Google Fonts** | (CDN) | Typographie (Inter) |

---

## 4. Structure du projet

```
docmaster-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              ← Pool de connexions PostgreSQL
│   │   │   └── passport.js        ← Stratégie OAuth Google
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── files.controller.js
│   │   │   └── jobs.controller.js
│   │   ├── jobs/
│   │   │   ├── queue.js           ← Définition de la queue Bull
│   │   │   ├── pdfWorker.js       ← Worker principal (processus séparé)
│   │   │   └── cronCleanup.js     ← Nettoyage des fichiers expirés
│   │   ├── middlewares/
│   │   │   ├── verifyToken.js     ← Vérification JWT
│   │   │   ├── uploads.js         ← Configuration Multer
│   │   │   ├── rateLimiter.js     ← Rate limiting
│   │   │   └── errorHandler.js    ← Gestionnaire d'erreurs global
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── files.routes.js
│   │   │   └── jobs.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── files.service.js
│   │   │   ├── jobs.service.js
│   │   │   └── pdf/
│   │   │       ├── merge.js
│   │   │       ├── split.js
│   │   │       ├── rotate.js
│   │   │       ├── compress.js
│   │   │       ├── protect.js       ← protectService + unprotectService
│   │   │       ├── watermark.js
│   │   │       ├── sign.js
│   │   │       ├── removePage.js
│   │   │       ├── addBlankPages.js
│   │   │       ├── extractImages.js
│   │   │       ├── addImage.js
│   │   │       ├── convertToPdf.js
│   │   │       ├── rasterize.js     ← PDF → Images
│   │   │       ├── pdfToTxt.js
│   │   │       ├── cleanMetadata.js
│   │   │       ├── dechiffrer.js    ← Déchiffrement préalable via qpdf
│   │   │       ├── parsePages.js    ← Parser de sélection de pages
│   │   │       ├── loadPdf.js       ← Chargement PDF avec gestion des erreurs
│   │   │       └── gsCommand.js     ← Résolution du chemin Ghostscript
│   │   └── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx               ← Routing principal
    │   ├── main.jsx              ← Point d'entrée React
    │   ├── index.css             ← Design system + animations CSS
    │   ├── context/
    │   │   └── ToastContext.jsx  ← Système de notifications toast
    │   ├── data/
    │   │   └── tools.js          ← Configuration de tous les outils
    │   ├── pages/
    │   │   ├── Home.jsx          ← Landing page publique
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── AuthCallback.jsx  ← Réception tokens OAuth Google
    │   │   ├── Dashboard.jsx
    │   │   ├── ToolPage.jsx      ← Page générique d'outil
    │   │   ├── FilesPage.jsx     ← Onglet "Fichiers actifs"
    │   │   ├── SettingsPage.jsx  ← Paramètres de compte
    │   │   ├── FreePage.jsx
    │   │   ├── HelpPage.jsx
    │   │   ├── TermsPage.jsx
    │   │   └── PrivacyPage.jsx
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── ProtectedRoute.jsx
    │   │   ├── dashboard/
    │   │   │   ├── DropZone.jsx
    │   │   │   ├── RecentFiles.jsx
    │   │   │   └── StatsCards.jsx
    │   │   ├── layout/
    │   │   │   ├── AppLayout.jsx
    │   │   │   ├── PublicLayout.jsx
    │   │   │   ├── AppHeader.jsx
    │   │   │   ├── AppSidebar.jsx
    │   │   │   ├── NotificationDrawer.jsx
    │   │   │   └── PublicFooter.jsx
    │   │   ├── ui/
    │   │   │   └── ConfirmDialog.jsx  ← Dialogue de confirmation unifié
    │   │   └── workspace/
    │   │       ├── ToolWorkspaceLayout.jsx  ← Orchestrateur principal
    │   │       ├── FileConfirmation.jsx
    │   │       ├── JobTracker.jsx
    │   │       ├── ResultCard.jsx
    │   │       ├── MultiFileSelection.jsx
    │   │       ├── SignatureDisclaimer.jsx
    │   │       ├── options/              ← Composants d'options par outil
    │   │       └── viewer/               ← Visionneur PDF + Signature
    │   ├── services/
    │   │   └── api/
    │   │       ├── axiosClient.js  ← Client HTTP centralisé + intercepteurs
    │   │       └── authApi.js
    │   ├── store/
    │   │   ├── useAuthStore.js   ← Store d'authentification
    │   │   └── useFileStore.js   ← Store de gestion de fichiers
    │   ├── hooks/
    │   │   ├── useScrollAnimation.js
    │   │   └── useParallax.js
    │   └── utils/
    │       └── formatters.js     ← formatSize, traduireSelection
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 5. Backend — Détail technique

### 5.1 Serveur Express (`server.js`)

Le fichier `server.js` est le point d'entrée du serveur. Il :
- Charge les variables d'environnement via `dotenv`
- Configure CORS pour autoriser uniquement `localhost` (toutes les origines de développement local)
- Initialise Passport.js pour OAuth
- Monte les routes : `/api/auth`, `/api/files`, `/api/jobs`
- Applique le rate limiter global (60 req/min) et un rate limiter strict pour l'upload (20/min)
- Lance le cron de nettoyage des fichiers expirés **toutes les heures** (via `setInterval`)
- Lance une **première passe de nettoyage au démarrage**
- Expose `/api/health` (non protégé) et `/api/health/protected` (avec JWT) pour les tests

```javascript
// Démarrage sur le port 5001 (variable PORT du .env)
app.listen(port, () => console.log(`Server running on http:localhost:${port}`));
```

### 5.2 Base de données PostgreSQL

**Connexion** : Pool de connexions via la librairie `pg` (node-postgres).

```javascript
// db.js — Pool partagé dans toute l'application
const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  port: process.env.DBPORT,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});
```

#### Modèle de données (tables principales)

**Table `users`**
| Colonne | Type | Description |
|---|---|---|
| `id_users` | UUID (PK) | Identifiant unique |
| `email` | VARCHAR | Email (unique) |
| `mot_de_passe` | VARCHAR | Hash bcrypt (NULL pour OAuth) |
| `nom_complet` | VARCHAR | Nom affiché |
| `photo_url` | VARCHAR | URL photo (OAuth Google) |
| `oauth_provider` | VARCHAR | `'google'` ou NULL |
| `plan` | VARCHAR | `'gratuit'` ou `'pro'` |
| `stockage_utilise` | BIGINT | Octets utilisés |
| `quota_stockage` | BIGINT | Quota en octets |
| `created_at` | TIMESTAMP | Date de création |

**Table `files`**
| Colonne | Type | Description |
|---|---|---|
| `id_files` | UUID (PK) | Identifiant unique |
| `owner_id` | UUID (FK) | Référence vers `users.id_users` |
| `nom_original` | VARCHAR | Nom d'origine du fichier |
| `nom_stockage` | VARCHAR | Nom UUID sur le disque |
| `chemin` | TEXT | Chemin absolu sur le disque |
| `taille_octets` | BIGINT | Taille en octets |
| `type_mime` | VARCHAR | Type MIME (pdf, zip, png...) |
| `expire_le` | TIMESTAMP | Expiration à `NOW() + 24h` |
| `created_at` | TIMESTAMP | Date d'upload |

**Table `jobs`**
| Colonne | Type | Description |
|---|---|---|
| `id_jobs` | UUID (PK) | Identifiant unique |
| `user_id` | UUID (FK) | Référence vers `users.id_users` |
| `type_operation` | VARCHAR | Identifiant de l'opération |
| `statut` | VARCHAR | `pending`, `processing`, `done`, `error` |
| `progression` | INTEGER | 0 à 100 |
| `resultat_url` | TEXT | URL de téléchargement du résultat |
| `erreur_message` | TEXT | Message d'erreur si échec |
| `created_at` | TIMESTAMP | Création du job |
| `started_at` | TIMESTAMP | Début du traitement |
| `completed_at` | TIMESTAMP | Fin du traitement |

**Table `jobs_files`** (relation N-N)
| Colonne | Type | Description |
|---|---|---|
| `jobs_id` | UUID (FK) | Référence vers `jobs` |
| `files_id` | UUID (FK) | Référence vers `files` |
| `role` | VARCHAR | `'input'` ou `'output'` |

**Table `refresh_tokens`**
| Colonne | Type | Description |
|---|---|---|
| `user_id` | UUID (FK) | Référence vers `users` |
| `token` | TEXT | Refresh token JWT |
| `expires_at` | TIMESTAMP | Expiration (7 jours) |

### 5.3 Authentification & Sécurité

#### Stratégie de tokens JWT

Le projet utilise une stratégie **double-token** :

- **Access Token** : durée de vie **15 minutes**. Contient `{ id, email, nom_complet, plan }`. Stocké uniquement **en mémoire** (store Zustand), jamais dans `localStorage`.
- **Refresh Token** : durée de vie **7 jours**. Contient uniquement `{ id }`. Stocké dans `localStorage` (seule exception justifiée par le besoin de persistance de session au rechargement).

**Flux d'authentification classique :**
1. `POST /api/auth/login` → vérification email + bcrypt.compare → génération des deux tokens → retour JSON
2. Frontend stocke `accessToken` en mémoire (Zustand) et `refreshToken` en localStorage
3. Chaque requête API envoie l'access token dans le header : `Authorization: Bearer <token>`
4. À expiration (HTTP 401), l'intercepteur Axios tente un **refresh silencieux** via `POST /api/auth/refresh`
5. Si le refresh échoue → session effacée, redirection vers `/login`

**Middleware `verifyToken`** :
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // { id, email, nom_complet, plan }
next();
```

#### Hachage des mots de passe

```javascript
// Facteur de coût bcrypt = 12 (recommandation 2026)
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
```

#### OAuth Google (Passport.js)

Flux :
1. `GET /api/auth/google` → redirection vers Google
2. Google rappelle `GET /api/auth/google/callback`
3. Passport vérifie le profil, crée ou met à jour le compte en BDD
4. Génère les tokens DocMaster et redirige vers `FRONTEND_URL/auth/callback?access_token=...&refresh_token=...`
5. `AuthCallback.jsx` récupère les tokens depuis l'URL, les stocke et redirige vers `/dashboard`

**Sécurité** : Les tokens dans l'URL sont temporaires et immédiatement consommés par le frontend.

#### Rate Limiting

```javascript
// Limite générale : 60 requêtes/minute/IP
// Limite upload/jobs : 20 requêtes/minute/IP
```

### 5.4 Gestion des fichiers

#### Upload (`POST /api/files/upload`)

Middleware **Multer** :
- Limite de taille : **50 Mo** par fichier
- Formats acceptés : `pdf`, `jpg`, `jpeg`, `png`, `docx`, `xlsx`, `pptx`, `tiff`, `tif`
- Nom de stockage : UUID généré aléatoirement (`uuid.ext`)
- Dossier de stockage : `./tmp/uploads/` (configurable via `UPLOAD_DIR`)
- Correction d'encodage : le nom original est ré-encodé de `latin1` vers `utf8` (bug Multer/navigateur)
- Vérification du quota avant insertion
- Insertion en base avec `expire_le = NOW() + 24h`

Il existe aussi `POST /api/files/upload-temp` : upload sans insertion en BDD, sans comptage de quota. Utilisé pour les fichiers d'images de signature qui sont temporaires.

#### Téléchargement (`GET /api/files/download/:id`)

Route protégée par JWT. Lit le fichier depuis le chemin disque stocké en BDD et utilise `res.download()` pour envoyer le fichier. Le frontend télécharge via `axiosClient` avec `responseType: 'blob'` pour inclure le token d'authentification.

#### Suppression (`DELETE /api/files/:id`)

Vérifie que le fichier appartient à l'utilisateur (`owner_id`), supprime le fichier physique du disque, supprime l'enregistrement en BDD, et décrémente le stockage utilisé.

### 5.5 Système de jobs asynchrones (Bull + Redis)

#### Pourquoi des jobs asynchrones ?

Les traitements PDF peuvent durer de quelques secondes à plusieurs minutes (compression lourde, conversion Office, extraction d'images). Bloquer la réponse HTTP serait inacceptable. Bull permet de mettre le traitement en file d'attente et de laisser le frontend interroger l'état du job.

#### Configuration Bull (`queue.js`)

```javascript
const pdfQueue = new Bull('pdf-processing', {
  redis: { host: 'localhost', port: 6379 },
  defaultJobOptions: {
    attempts: 3,          // 3 tentatives en cas d'échec
    backoff: { type: 'fixed', delay: 5000 }, // 5s entre les tentatives
    removeOnComplete: true,
    removeOnFail: 100     // Garder les 100 derniers jobs échoués
  }
});
```

#### Création d'un job (`POST /api/jobs`)

1. Validation du `type_operation` (liste blanche de 16 valeurs)
2. Vérification que les fichiers existent et appartiennent à l'utilisateur
3. Insertion en BDD avec `statut = 'pending'`
4. Liaison des fichiers d'entrée dans `jobs_files` (role `'input'`)
5. Ajout dans la queue Bull avec `pdfQueue.add({ jobId, type_operation, fichiers, options, userId })`

#### Exécution dans le Worker (`pdfWorker.js`)

Le Worker tourne dans un processus séparé (`npm run worker`). Pour chaque job :

1. **Mise à jour statut** → `processing`, `progression = 10`
2. **Récupération des chemins** → requête BDD pour obtenir `chemin` de chaque fichier
3. **Déchiffrement préalable** → si `options.motDePassePdf` est fourni et l'opération n'est pas `protect`/`unprotect`, déchiffrement via `qpdf --decrypt` vers un fichier temporaire. pdf-lib ne supporte pas le déchiffrement AES-256 en lecture.
4. **Switch sur `type_operation`** → appel du service PDF correspondant
5. **Enregistrement du résultat** → insertion dans `files` avec `expire_le = NOW() + 24h`, liaison dans `jobs_files` (role `'output'`)
6. **Mise à jour job** → `statut = 'done'`, `resultat_url = /api/files/download/<uuid>`, `progression = 100`
7. **Nettoyage** → suppression des fichiers temporaires de déchiffrement

En cas d'erreur :
```javascript
await pool.query(`UPDATE jobs SET statut = 'error', erreur_message = $1 WHERE id_jobs = $2`, [error.message, jobId]);
```

#### Interrogation du statut (`GET /api/jobs/:id`)

Le frontend poll toutes les 2 secondes via `JobTracker.jsx`. Retourne `{ statut, progression, resultat_url }`.

### 5.6 Services PDF — Détail de chaque outil

#### `merge.js` — Fusion de PDF

**Librairie** : `pdf-lib`  
**Algorithme** :
1. Crée un `PDFDocument` vide
2. Pour chaque fichier source, charge le PDF avec `loadPdf(bytes)`
3. Copie toutes les pages avec `pdfFusionne.copyPages(source, source.getPageIndices())`
4. Ajoute chaque page au document final
5. Sauvegarde avec `pdfFusionne.save()` → fichier UUID sur disque

**Gestion des PDFs chiffrés** : si `motDePassePdf` est fourni, chaque fichier est d'abord déchiffré via `dechiffrerAvecQpdf()`.

#### `split.js` — Division de PDF

**Librairie** : `pdf-lib`  
**Modes** :
- `single` : génère un seul PDF contenant les pages sélectionnées
- `separate` : génère un PDF par groupe (ex: `"1-3, 5"` → deux fichiers), packagés dans un ZIP

**Sélection des pages** : utilise `parsePageSelection()` ou `parsePageGroups()` selon le mode.

#### `rotate.js` — Rotation de pages

**Librairie** : `pdf-lib`  
**Algorithme** : Charge le PDF, parcourt les pages sélectionnées, appelle `page.setRotation(degrees(angle))` pour chaque page, sauvegarde.

**Angles supportés** : 90, 180, 270 degrés.

#### `compress.js` — Compression

**Librairie** : **Ghostscript** (outil système, appel CLI via `child_process.exec`)  
**Niveaux de compression** :
- `haute` → paramètre Ghostscript `/screen` (72 DPI, fichier minimal)
- `moyenne` → `/ebook` (150 DPI, bon compromis)
- `basse` → `/printer` (300 DPI, compression légère)

**Commande type** :
```bash
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -dQUIET -sOutputFile="sortie.pdf" "entree.pdf"
```

**Fallback intelligent** : si le fichier résultat est plus grand que l'original, le service retourne le fichier original sans erreur (cas des PDF déjà optimisés).

#### `protect.js` — Protection par mot de passe

**Librairie** : **qpdf** (outil système)  
**Chiffrement** : AES-256 bits (paramètre `256` de qpdf)  
**Commande type** :
```bash
qpdf --encrypt "motdepasse" "motdepasse" 256 -- "source.pdf" "sortie.pdf"
```

**Pré-nettoyage intelligent** : avant de chiffrer, le service tente de réparer la structure du PDF via `qpdf --linearize`. Si cela échoue, fallback vers Ghostscript (`gs -sDEVICE=pdfwrite`). Cela corrige les PDFs corrompus ou avec des clés dupliquées qui feraient échouer qpdf.

**`unprotectService`** :
```bash
qpdf --decrypt --password="motdepasse" "source.pdf" "sortie.pdf"
```

#### `watermark.js` — Filigrane texte

**Librairie** : `pdf-lib`  
**Options** :
- `texte` : texte du filigrane
- `opacite` : 0 à 1
- `rotation` : angle en degrés (défaut 45°)
- `taillePolice` : en points
- `couleur` : hex `#RRGGBB` ou objet `{r, g, b}` (valeurs 0-1)
- `position` : `centre`, `haut-gauche`, `haut-droite`, `bas-gauche`, `bas-droite`, `haut-centre`, `bas-centre`

La police utilisée est `Helvetica` (police standard intégrée dans pdf-lib, pas de dépendance externe).

#### `sign.js` — Signature électronique simple

**Librairie** : `pdf-lib`

> ⚠️ **Non eIDAS** : Cette signature est une **incrustation visuelle** de l'image sur le PDF. Elle n'a pas de valeur légale au sens du règlement européen eIDAS car elle ne contient pas de certificat cryptographique. Ce point est communiqué à l'utilisateur dans l'interface et dans le résultat (champ `disclaimer`).

**Algorithme** :
1. Charge le PDF et l'image de signature
2. Détecte le format de l'image (PNG vs JPG) via les 4 premiers octets de l'en-tête hexadécimal (`89504e47` = PNG, `ffd8...` = JPEG)
3. Intègre l'image avec `pdfDoc.embedPng()` ou `pdfDoc.embedJpg()`
4. Dessine l'image à la position `(x, y)` avec les dimensions spécifiées
5. Optionnel : si `ajouterDate = true`, ajoute la date/heure sous la signature en police Helvetica 10pt

**Coordonnées** : le système de coordonnées de PDF est cartésien (origine en bas à gauche). Le `PdfSignatureViewer.jsx` convertit les coordonnées de l'écran (SVG) vers le système PDF.

#### `addBlankPages.js` — Ajout de pages vierges

**Librairie** : `pdf-lib`  
**Formats de page prédéfinis** (en points, 1pt = 1/72 pouce) :
- `a4` → 595.28 × 841.89 pts (210 × 297 mm)
- `a3` → 841.89 × 1190.55 pts
- `a5` → 419.53 × 595.28 pts
- `letter` → 612 × 792 pts (US Letter)
- `legal` → 612 × 1008 pts

**Positions** : `'debut'` (index 0), `'fin'` (après la dernière page), ou un numéro de page (insertion après la page N).

#### `convertToPdf.js` — Office vers PDF

**Outil** : **LibreOffice** en mode headless  
**Commande type** :
```bash
soffice --headless --convert-to pdf --outdir "/dossier/sortie" "document.docx"
```

**Timeout** : 120 secondes (2 minutes) pour les gros fichiers XLSX/PPTX.  
**Détection Windows** : recherche l'exécutable dans `C:\Program Files\LibreOffice\program\soffice.exe`, fallback vers `soffice` dans le PATH.

#### `rasterize.js` — PDF vers Images

**Outil** : **Ghostscript**  
**Résolutions disponibles** : 72, 96, 150, 300 DPI (configurable via options)  
**Format** : PNG (`png16m`) ou JPEG (`jpeg`)  
**Anti-aliasing** : `-dTextAlphaBits=4 -dGraphicsAlphaBits=4`

Si plusieurs pages sont sélectionnées, chaque page est rasterisée individuellement puis toutes les images sont packagées dans une archive **ZIP** via `archiver`.

**Commande par page** :
```bash
gs -sDEVICE=png16m -r150 -dFirstPage=2 -dLastPage=2 -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -dNOPAUSE -dBATCH -dQUIET -sOutputFile="page_2.png" "source.pdf"
```

#### `pdfToTxt.js` — PDF vers Texte

**Librairie** : `pdf-parse` v2  
**Important** : ne fonctionne que sur les PDF textuels (non scannés). Les PDF de type image (scan) ne contiennent pas de texte sélectionnable.  
**Options** : sélection de pages via `parsePageSelection()`.  
**Sortie** : fichier `.txt` encodé UTF-8.

#### `extractImages.js` — Extraction d'images

**Librairie** : `pdf-lib` (lecture des objets XObject de type Image)  
Si plusieurs images extraites → archive ZIP via `archiver`.

#### `addImage.js` — Incrustation d'image

**Librairie** : `pdf-lib`  
Même logique que `sign.js` : charge le PDF, embed l'image (PNG ou JPG), dessine à la position spécifiée.

#### `cleanMetadata.js` — Nettoyage de métadonnées

**Librairie** : `pdf-lib`  
Réinitialise tous les champs de métadonnées :
```javascript
pdfDoc.setTitle('');
pdfDoc.setAuthor('');
pdfDoc.setSubject('');
pdfDoc.setKeywords([]);
pdfDoc.setProducer('');
pdfDoc.setCreator('');
pdfDoc.setCreationDate(new Date(0));
pdfDoc.setModificationDate(new Date(0));
```

#### `parsePages.js` — Moteur de sélection de pages

Module utilitaire central utilisé par `split`, `rotate`, `remove_pages`, `watermark`, `sign`, `rasterize`, `pdfToTxt`.

**Syntaxe supportée** :
- Pages individuelles : `"2, 8, 14"`
- Plages : `"5-10"`
- Combinaison : `"1-3, 7, 12-15"`

**Deux fonctions** :
- `parsePageSelection(selection, totalPages)` → `number[]` trié et dédupliqué
- `parsePageGroups(selection, totalPages)` → `number[][]` (un groupe par segment CSV)

**Validations** : plages inversées (`5-2`), numéros hors bornes, syntaxe invalide — toutes lèvent des erreurs explicites.

#### `dechiffrer.js` — Déchiffrement préalable

**Problème résolu** : `pdf-lib` ne peut pas lire les PDF chiffrés en AES-256. Solution : avant tout traitement, si un `motDePassePdf` est fourni, on crée un fichier déchiffré temporaire via qpdf. Ce fichier est utilisé pour le traitement et supprimé après.

```javascript
await dechiffrerAvecQpdf(cheminOriginal, motDePasse); // → cheminTemp
// ... traitement ...
nettoyerFichierTemp(cheminTemp, cheminOriginal);
```

**Exceptions** : `protect` et `unprotect` utilisent directement qpdf et gèrent leur propre déchiffrement.

### 5.7 Nettoyage automatique (`cronCleanup.js`)

```javascript
// Lancé toutes les heures + au démarrage du serveur
setInterval(nettoyerFichiersExpires, 3600000);
nettoyerFichiersExpires();
```

**Algorithme** :
1. Sélectionne tous les fichiers où `expire_le IS NOT NULL AND expire_le < NOW()`
2. Pour chaque fichier : supprime le fichier physique (`fs.unlinkSync`), supprime l'enregistrement BDD, décrémente `stockage_utilise` de l'utilisateur
3. Log le nombre de fichiers supprimés et les mégaoctets libérés

---

## 6. Frontend — Détail technique

### 6.1 Routing SPA (`App.jsx`)

```
/               → Home (public)
/login          → Login
/register       → Register
/auth/callback  → AuthCallback (OAuth)
/terms          → TermsPage
/privacy        → PrivacyPage
/free           → FreePage
/help           → HelpPage
/dashboard              → Dashboard (protégé)
/dashboard/tools/:toolId → ToolPage (protégé)
/dashboard/files         → FilesPage (protégé)
/dashboard/settings      → SettingsPage (protégé)
```

**`ProtectedRoute`** : vérifie `isLoading` (attente init auth) puis `user`. Si non connecté, redirige vers `/login`.

**Navigation en SPA** : les onglets de l'atelier (Sélection → Configuration → Traitement → Résultat) sont gérés par `useState` dans `ToolWorkspaceLayout`, **pas par des routes séparées**. C'est une règle non-négociable du projet.

### 6.2 Gestion d'état (Zustand)

#### `useAuthStore`

État global d'authentification. Contient :
- `user` : infos de l'utilisateur (décodées du JWT)
- `accessToken` : token en mémoire
- `isLoading` : true pendant `initializeAuth()`
- `error` : message d'erreur de connexion

**`initializeAuth()`** : appelé au montage de `<App>`. Lit le `refreshToken` du localStorage, tente un refresh silencieux, décode le JWT retourné pour extraire les infos user.

**`setTokensFromOAuth()`** : reçoit les tokens depuis `AuthCallback.jsx`, décode le JWT Base64Url pour extraire les infos user.

#### `useFileStore`

État du fichier courant dans l'atelier :
- `currentFile` : `{ fileId, nomOriginal, tailleOctets }`
- `uploadStatus` : `idle | uploading | done | error`
- `uploadProgress` : 0-100
- `filesVersion` : compteur incrémenté à chaque upload/suppression pour déclencher le rafraîchissement de `RecentFiles`
- `cancelCurrentFile()` : supprime le fichier côté serveur si l'utilisateur annule

### 6.3 Client HTTP — Axios (`axiosClient.js`)

Instance Axios configurée avec `baseURL = 'http://localhost:5001/api'`.

**Intercepteur de requête** : injecte automatiquement `Authorization: Bearer <accessToken>` dans chaque requête sortante. Lit le token depuis `useAuthStore.getState().accessToken`.

**Intercepteur de réponse — Refresh silencieux** :
```
Requête → 401 reçu
  → Si isRefreshing = true → met la requête en file d'attente (failedQueue)
  → Sinon : isRefreshing = true, appel POST /auth/refresh
    → Succès : nouveau accessToken → processQueue (rejoue toutes les requêtes en attente)
    → Échec : clearSession(), redirection /login
```

**Anti-doublon** : le verrou `isRefreshing` et la `failedQueue` évitent que 5 requêtes simultanées déclenchent 5 refresh en parallèle.

**Dépendance circulaire résolue** : `axiosClient` référence le store via `setAuthStore()` (injection de dépendance paresseuse) pour éviter le cycle `axiosClient ← authApi ← useAuthStore ← axiosClient`.

### 6.4 Système de notifications Toast (`ToastContext.jsx`)

**Pourquoi un contexte ?** Pour pouvoir appeler `toast.success("...")` depuis n'importe quel composant sans prop drilling.

```javascript
// Utilisation
const toast = useToast();
toast.success("Fichier supprimé avec succès."); // Disparaît après 4s
toast.error("Erreur réseau.");                   // Disparaît après 6s
toast.warning("Expire bientôt.");                // Disparaît après 5s
toast.info("Téléchargement en cours...");        // Disparaît après 3s
```

**Limite** : max 4 toasts simultanés (les plus anciens sont supprimés).

**Rendu** : `ToastContainer` est positionné `fixed bottom-6 right-6 z-[9999]`. Chaque toast s'anime avec `slideInRight` (CSS keyframe) et dispose d'une barre colorée en bas pour identifier le type.

### 6.5 Architecture de l'atelier de traitement (`ToolWorkspaceLayout.jsx`)

C'est le composant le plus complexe du frontend. Il gère toutes les étapes de traitement pour chaque outil.

#### Étapes

| Étape | Composant | Rôle |
|---|---|---|
| `selection` | `DropZone` ou `MultiFileSelection` | Upload et sélection des fichiers |
| `configuration` | `<OptionsComponent>` spécifique | Paramétrage de l'outil |
| `traitement` | `JobTracker` | Polling du statut de job |
| `resultat` | `ResultCard` | Téléchargement du résultat |

#### `OPTIONS_MAP`

Dictionnaire qui associe chaque `tool.id` au composant d'options correspondant :
```javascript
const OPTIONS_MAP = {
  compress: CompressOptions,
  protect: ProtectOptions,
  split: SplitOptions,
  // ...16 outils
};
```

#### Déclenchement d'un traitement

```javascript
// 1. Créer le job via API
const response = await axiosClient.post('/jobs', {
  type_operation: tool.typeOperation,
  fichiers: [currentFile.fileId],
  options: { ...optionsLocales }
});
// 2. Stocker l'ID du job
setActiveJobId(response.data.data.id_jobs);
// 3. Passer à l'étape "traitement"
setStep('traitement');
```

#### Visionneur PDF (`PdfThumbnailViewer`)

Utilisé pour les outils nécessitant une sélection de pages (split, rotate, remove_pages, etc.). Charge le PDF via **pdf.js** et affiche des vignettes de chaque page. L'utilisateur clique sur les pages pour les sélectionner.

Trois modes de sélection :
- `range` : 1er clic = début, 2e clic = fin de plage
- `multiple` : cliquer pour cocher/décocher individuellement
- `mixed` : simple clic = page isolée, double clic = début/fin de plage

#### Visionneur de signature (`PdfSignatureViewer`)

Interface permettant de positionner la signature sur le PDF. L'image de signature est dessinée par-dessus un rendu de la page PDF (SVG overlay). L'utilisateur peut :
- Glisser la signature pour la déplacer
- Redimensionner via les poignées de coin
- Choisir la page cible

Lorsque l'utilisateur valide, les coordonnées sont converties du repère SVG vers le repère PDF (inversion de l'axe Y).

#### Disclaimer de signature

`SignatureDisclaimer.jsx` affiche un modal d'avertissement obligatoire avant d'utiliser l'outil de signature. L'acceptation est mémorisée dans `localStorage` pour ne pas être redemandée à chaque fois.

#### `MultiFileSelection.jsx` — Upload multi-fichiers (Fusion)

Utilisé pour l'outil `merge`. Permet de glisser-déposer jusqu'à 20 fichiers. Chaque fichier est uploadé immédiatement après ajout (avec barre de progression individuelle). La liste est réordonnée par drag & drop (bibliothèque `@hello-pangea/dnd`). L'ordre final détermine l'ordre de fusion.

### 6.6 Composants clés

#### `ConfirmDialog.jsx`

Dialogue de confirmation unifié, utilisé dans tout le projet pour les suppressions. Props :
- `isOpen`, `title`, `message`
- `onConfirm`, `onCancel`
- `confirmText`, `cancelText`
- `isDestructive` : rouge si `true` (suppression), bleu si `false`

Rendu avec un fond semi-transparent (`backdrop-blur`) et animation `scaleIn`.

#### `NotificationDrawer.jsx`

Panneau latéral droit (accessible via la cloche 🔔 dans l'AppHeader). Affiche les jobs des dernières 24h. Pour chaque job terminé avec succès, propose un bouton **Télécharger** qui recharge le fichier résultat via `axiosClient` (avec token JWT) même après navigation.

#### `RecentFiles.jsx`

Tableau des derniers fichiers uploadés sur le Dashboard. Se rafraîchit automatiquement via `useFileStore.filesVersion`. Affiche date, taille, et permet téléchargement et suppression (avec `ConfirmDialog`).

#### `ResultCard.jsx`

Carte finale affichée après un traitement réussi. Affiche le nom du fichier résultat, sa taille, et le bouton de téléchargement. Télécharge via `axiosClient` avec `responseType: 'blob'`.

---

## 7. Flux de traitement complet (end-to-end)

Exemple : **compression d'un PDF de 10 Mo**

```
1. Utilisateur ouvre /dashboard/tools/compress
   └─► ToolPage.jsx cherche l'outil par ID dans tools.js → rendu ToolWorkspaceLayout

2. Étape "Sélection" → DropZone.jsx
   └─► Glisse le PDF → appel POST /api/files/upload (multipart/form-data)
   └─► verifyToken ✓ → checkQuota ✓ → Multer sauve le fichier → createFileService
   └─► INSERT files (id UUID, expire_le = NOW() + 24h)
   └─► Réponse : { fileId, nomOriginal, taille }
   └─► useFileStore.uploadSuccess({ fileId, ... }) → step = 'configuration'

3. Étape "Configuration" → CompressOptions.jsx
   └─► Choix du niveau : "Moyenne (ebook)"
   └─► Clic "Compresser" → handleStart()
   └─► POST /api/jobs { type_operation: "compress", fichiers: [fileId], options: { niveau: "moyenne" } }
   └─► createJobService → INSERT jobs (statut = 'pending') → pdfQueue.add(...)
   └─► Réponse : { id_jobs: "abc-123" } → setActiveJobId("abc-123") → step = 'traitement'

4. Étape "Traitement" → JobTracker.jsx
   └─► Poll GET /api/jobs/abc-123 toutes les 2 secondes
   └─► [Bull Worker, processus séparé]
       ├─► UPDATE jobs statut='processing', progression=10
       ├─► SELECT chemin FROM files WHERE id_files = fileId → /tmp/uploads/xyz.pdf
       ├─► compressService("/tmp/uploads/xyz.pdf", "moyenne")
       │   └─► gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook ... -sOutputFile="result.pdf" "xyz.pdf"
       │   └─► Résultat : 3.2 Mo (réduction de 68%)
       ├─► UPDATE jobs progression=80
       ├─► INSERT files (resultat, expire_le=NOW()+24h) → id "def-456"
       ├─► INSERT jobs_files (jobs_id, files_id='def-456', role='output')
       └─► UPDATE jobs statut='done', resultat_url='/api/files/download/def-456', progression=100
   └─► JobTracker reçoit statut='done' → setJobResult → step = 'resultat'

5. Étape "Résultat" → ResultCard.jsx
   └─► Affiche "resultat_compress.pdf — 3.2 Mo"
   └─► Clic "Télécharger"
       └─► axiosClient.get('/files/download/def-456', { responseType: 'blob' })
       └─► Header: Authorization: Bearer <accessToken>
       └─► Backend: verifyToken ✓ → SELECT chemin FROM files → res.download()
       └─► Blob → URL.createObjectURL → <a download> → clic programmatique
```

---

## 8. Sécurité

| Mesure | Détail |
|---|---|
| **Tokens JWT en mémoire** | `accessToken` jamais en localStorage/sessionStorage |
| **Refresh Token localStorage** | Seule exception justifiée pour la persistance de session |
| **Hachage bcrypt coût 12** | Standard recommandé en 2026 |
| **Chiffrement AES-256** | Via qpdf pour les PDF protégés |
| **Vérification `owner_id`** | Chaque accès fichier vérifie l'appartenance à l'utilisateur |
| **CORS restreint** | Uniquement `localhost` en dev |
| **Rate Limiting** | 60 req/min général, 20 req/min upload |
| **Middleware verifyToken** | Toutes les routes sensibles sont protégées |
| **Chemins disque non exposés** | Seul `resultat_url` (`/api/files/download/<uuid>`) est exposé |
| **Noms de fichiers UUID** | Les fichiers sur disque n'ont aucun lien avec leur nom original |
| **Messages d'erreur login vagues** | "Email ou mot de passe incorrect" (pas d'énumération d'email) |
| **Nettoyage fichiers temp** | Les fichiers déchiffrés temporaires sont supprimés après traitement |
| **Expiration automatique** | Tous les fichiers expirent en 24h et sont supprimés |

---

## 9. Bibliothèques et justifications des choix

### `pdf-lib` (manipulation PDF)

**Pourquoi** : seule librairie JavaScript pure capable de créer, modifier et lire des PDF sans dépendance système. Supportée en Node.js. Permet la manipulation de pages, l'incrustation d'images, l'écriture de texte, la gestion des métadonnées.  
**Limites** : ne supporte pas le déchiffrement AES-256 en lecture → nécessite qpdf en amont.

### `Ghostscript` (CLI système)

**Pourquoi** : référence mondiale pour la compression PDF (algorithme de ré-écriture PostScript). Supporte nativement les PDFs chiffrés via `-sPDFPassword`. Utilisé pour la compression et la rasterisation.  
**Appel** : `child_process.exec()` avec `promisify`.

### `qpdf` (CLI système)

**Pourquoi** : seul outil libre capable de chiffrer/déchiffrer des PDF en AES-256 de manière fiable. pdf-lib ne le fait pas. Utilisé pour `protect`, `unprotect`, et le déchiffrement préalable.

### `LibreOffice` (CLI système)

**Pourquoi** : conversion haute fidélité des formats Office (DOCX, XLSX, PPTX) vers PDF. Mode headless (`--headless`) pour usage serveur sans interface graphique.

### `Bull` (queue asynchrone)

**Pourquoi** : bibliothèque de référence pour les files d'attente Redis en Node.js. Gestion des retries, du progress, des événements (complete, failed, stalled). Permet de séparer le serveur HTTP du Worker.

### `Zustand` (state management)

**Pourquoi** : alternative légère à Redux. API simple basée sur `create()`. Pas de Provider obligatoire. Accès depuis n'importe où via `store.getState()` (utile pour les intercepteurs Axios). Minimaliste et rapide.

### `@hello-pangea/dnd` (drag & drop)

**Pourquoi** : fork maintenu de `react-beautiful-dnd` (abandonné). Drag & drop accessible et animé pour la réorganisation des fichiers dans l'outil de fusion.

### `archiver` (création de ZIP)

**Pourquoi** : bibliothèque standard Node.js pour créer des archives ZIP streamées. Utilisée quand un traitement produit plusieurs fichiers (split en mode separate, PDF→images multi-pages).

---

## 10. Variables d'environnement (`.env` backend)

```env
# Serveur
PORT=5001

# Base de données PostgreSQL
HOST=localhost
USER=<user_postgres>
PASSWORD=<password>
DBPORT=5432
DATABASE=docmaster

# JWT
JWT_SECRET=<secret_access_token>
JWT_REFRESH_SECRET=<secret_refresh_token>

# Redis (Bull)
REDIS_HOST=localhost
REDIS_PORT=6379

# Stockage fichiers
UPLOAD_DIR=./tmp/uploads

# OAuth Google
GOOGLE_CLIENT_ID=<client_id>
GOOGLE_CLIENT_SECRET=<client_secret>
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Frontend (pour la redirection OAuth)
FRONTEND_URL=http://localhost:5173
```

---

## 11. Commandes de lancement

```bash
# Backend — Serveur Express (port 5001)
cd backend
npm run dev

# Backend — Worker Bull (processus séparé, écoute Redis)
cd backend
npm run worker

# Frontend — Serveur Vite (port 5173)
cd frontend
npm run dev

# Frontend — Build de production
cd frontend
npm run build
```

---

## 12. Limites connues et points d'attention

| Limitation | Explication |
|---|---|
| **Signature non-eIDAS** | Incrustation visuelle uniquement, sans certificat cryptographique. Communiqué à l'utilisateur. |
| **PDF scannés (images)** | L'extraction de texte (`pdf_to_txt`) ne fonctionne pas sur des PDF de type image (absence de texte sélectionnable). |
| **Quota stockage** | Calculé en base mais le cron de nettoyage peut créer un léger décalage si le fichier physique est absent (FileNotFoundException ignorée). |
| **Rechargement de page** | L'`accessToken` étant en mémoire, un rechargement de page force un refresh silencieux (appel `/auth/refresh`). Si le refresh token est expiré (>7j), l'utilisateur est déconnecté. |
| **Job après navigation** | Si l'utilisateur navigue pendant un traitement, le résultat est toujours accessible via le drawer de notifications (🔔) grâce à la persistance en BDD. |
| **Pas de paiement** | Hors scope V1. Le champ `plan` existe en BDD mais aucune logique de paiement n'est implémentée. |
| **Pas de mode visiteur** | Toute opération nécessite un compte. |
| **LibreOffice fidélité** | La conversion Office→PDF via LibreOffice est fonctionnelle mais peut avoir des différences cosmétiques mineures par rapport à Microsoft Office natif (polices spécifiques, macros). |
| **Windows / Linux** | Le chemin Ghostscript et LibreOffice est détecté dynamiquement. Sur Windows, le projet cherche dans `C:\Program Files\`. |
