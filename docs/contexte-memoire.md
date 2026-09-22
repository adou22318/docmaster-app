# Contexte Complet du Projet PDF DocMaster

## Document de référence pour la rédaction du mémoire

> **IMPORTANT pour l'assistant IA :** Ce document est la source de vérité unique sur l'état réel du projet. Ne jamais inventer, extrapoler ou généraliser au-delà de ce qui est écrit ici. Tout ce qui n'est pas mentionné dans ce fichier ne fait PAS partie du projet et ne doit pas apparaître dans le mémoire.

---

## 1. Contexte Institutionnel et Organisationnel

- **Type de projet :** Projet de fin de cycle — Licence Professionnelle en Génie Informatique et Télécommunications (G.I.T)
- **École :** ENI-ABT (École Nationale d'Ingénieurs Abderhamane Baba TOURE)
- **Entreprise d'accueil :** Mali Développeur SARL (Agence Web et de Communication digitale)
- **Auteur :** Abdoulaye MAÏGA
- **Date du Cahier des Charges :** 12 mai 2026

---

## 2. Présentation du Projet

**PDF DocMaster** est une application web SaaS (Software as a Service) de gestion, traitement, conversion et signature de documents PDF. Elle est conçue avec une philosophie **"Privacy-First"** : aucun fichier n'est supprimé automatiquement après téléchargement — la suppression est toujours une action explicite de l'utilisateur ou liée à la déconnexion.

L'application s'inspire des grandes plateformes internationales (Smallpdf, ILovePDF, Adobe Acrobat) tout en étant réalisée exclusivement avec des technologies open-source et gratuites, adaptées au contexte malien.

---

## 3. Planning Réel du Projet

### 3.1 Planning prévisionnel (Cahier des Charges — 12 mai 2026)

Le CDC prévoyait 4 phases sur 4 mois (avec une marge de 2 mois) :

| Phase | Semaines | Intitulé                     | Livrables prévus                                                                                     |
| ----- | -------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1     | S1–S3    | Mise en place & Architecture | Environnement de développement, structure du projet, BDD initialisée, authentification fonctionnelle |
| 2     | S4–S8    | Backend — Modules 1 & 2      | API REST complète pour conversion et manipulation de pages, file d'attente Bull/Redis opérationnelle |
| 3     | S9–S12   | Backend — Modules 3 & 4      | Compression, protection, filigrane, signature simples fonctionnels                                   |
| 4     | S13–S16  | Frontend & Intégration       | Interface React complète, tests, déploiement, documentation finale                                   |

### 3.2 Déroulement réel (jalons réels reconstitués depuis l'historique Git)

> Ces dates sont issues des commits Git du dépôt `adou22318/docmaster-app`.

| Date réelle (commit)  | Jalon accompli                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **18 mai 2026**       | Initialisation du projet (structure dossiers, package.json, configuration initiale)                                                                                            |
| **23 juin 2026**      | Système d'authentification JWT complet avec OAuth Google — Phase 1 achevée                                                                                                     |
| **30 juin 2026**      | Upload fichiers, Bull Queue, Worker, cron de nettoyage, connexion obligatoire — Phase 2 démarrage                                                                              |
| **11 juillet 2026**   | Modules PDF S3 : fusion, division, rotation, compression, protection, filigrane — tous validés Requestly                                                                       |
| **17 juillet 2026**   | Modules PDF S4 : rasterisation, extraction images embarquées, conversion Office→PDF, extraction texte, ajout image, signature — Phase 3 achevée                                |
| **3 août 2026**       | Intégration frontend : layout, landing page, correction authentification (Jour 1 frontend)                                                                                     |
| **7 août 2026**       | Refonte dashboard dynamique, upload Zustand, animations au scroll                                                                                                              |
| **22 août 2026**      | Sécurité PDF renforcée, refactoring Worker, intégration QPDF                                                                                                                   |
| **26 août 2026**      | Téléchargement depuis le drawer, gestion du profil utilisateur, documentation technique                                                                                        |
| **15 septembre 2026** | S5 complet : exigences encadreur, modules conversion (images→PDF, Office→PDF, PDF→TXT), signature 3 modes, drag & drop pages, système abonnement, intégration PayDunya sandbox |
| **15 septembre 2026** | Documentation technique complète (README, docs/pdf/_, docs/api/_, docs/frontend/\*)                                                                                            |
| **17 septembre 2026** | Correction vulnérabilités de sécurité npm (17 → 2 modérées restantes)                                                                                                          |

### 3.3 Écarts planification/réalisation et justifications

**Ce qui a été livré en avance ou différemment :**

- Le frontend a été développé en parallèle du backend (pas strictement séquentiel comme prévu). Cela a permis une intégration continue et une détection précoce des incompatibilités API/UI.
- La phase 4 (frontend) a démarré à partir d'août 2026, soit environ 2 mois après la phase 2, ce qui est cohérent avec la marge prévue.

**Ajouts non prévus au CDC initial (décisions prises en cours de projet) :**

- Système d'abonnement avec période d'essai automatique de 7 jours
- Intégration PayDunya (passerelle de paiement mobile money malienne) en mode sandbox
- Outil "Images → PDF" (assemblage multi-images)
- Drag & Drop pour la réorganisation des **fichiers images** dans l'outil « Images → PDF »
- Drag & Drop pour la **réorganisation des pages d'un PDF** (`PageReorderViewer.jsx`, ajouté le 22/09/2026 post-audit)
- Mode sombre/clair persisté
- Modale de déconnexion sécurisée avec avertissement de suppression des fichiers
- Composant `FileFormatError` avec redirection intelligente vers le bon outil

**Ce qui reste en dehors du périmètre livré :**

- Déploiement en production (conditionné à l'infrastructure payante — non financée à ce stade)
- Tests unitaires automatisés (taux de couverture ≥ 60% prévu au CDC)
- Documentation Swagger/OpenAPI (remplacée par une documentation Markdown manuelle)
- PayDunya en mode live (sandbox uniquement)

---

## 4. Architecture Générale

L'application repose sur une **architecture client-serveur découplée** avec deux projets distincts dans le même dépôt :

```
docmaster-app/
├── backend/    ← API REST Node.js/Express
└── frontend/   ← Application React/Vite
```

### 4.1 Architecture Backend

- **Serveur :** Node.js (v18+) avec Express.js v5
- **Base de données :** PostgreSQL 16 (via Docker Compose en local)
- **File d'attente :** Redis 7-alpine + Bull Queue (gestion des tâches asynchrones lourdes)
- **Stockage fichiers :** Dossier temporaire local (`./tmp/uploads/`) — aucun service cloud
- **Port par défaut :** 3001

#### Structure des dossiers backend :

```
backend/src/
├── config/         ← Configuration DB, Redis
├── controllers/    ← Logique métier HTTP (auth, files, jobs, payment)
├── jobs/           ← Worker Bull Queue (pdfWorker.js) + cronCleanup.js
├── middlewares/    ← verifyToken, checkSubscription, rateLimiter, uploads, errorHandler
├── routes/         ← auth.routes.js, files.routes.js, jobs.routes.js, payment.routes.js
├── services/
│   ├── auth.service.js
│   ├── payment.service.js
│   ├── jobs.service.js
│   └── pdf/        ← Un fichier par opération PDF
└── server.js
```

### 4.2 Architecture Frontend

- **Framework :** React 19 avec Vite
- **Styling :** Tailwind CSS (uniquement)
- **Routage :** React Router DOM v7
- **État global :** Zustand v5 (stores en mémoire, jamais en localStorage sauf préférences UI)
- **Client HTTP :** Axios avec intercepteurs JWT automatiques
- **Port de développement :** 5173

#### Structure des dossiers frontend :

```
frontend/src/
├── App.jsx
├── components/
│   ├── dashboard/     ← DashboardTools, RecentFiles, StatsCards
│   ├── layout/        ← TopAppBar, Footer, NotificationDrawer
│   ├── ui/            ← LogoutConfirmModal, Toasts, etc.
│   └── workspace/     ← ToolWorkspaceLayout, viewers, options par outil
├── context/           ← ToastContext
├── data/              ← tools.js (catalogue des outils)
├── hooks/             ← useTheme
├── pages/             ← LoginPage, RegisterPage, DashboardPage, ToolPage, PricingPage, etc.
├── services/api/      ← axiosClient.js, paymentApi.js
├── store/             ← useAuthStore.js, useFileStore.js, useNotificationStore.js
└── utils/             ← formatters.js, parsePages.js
```

---

## 5. Stack Technique Complète

### 5.1 Backend — Dépendances principales

| Paquet                  | Version | Rôle                                                                                                                     |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| express                 | ^5.2.1  | Serveur HTTP et routage API REST                                                                                         |
| pg                      | ^8.21.0 | Client PostgreSQL                                                                                                        |
| bull                    | ^4.16.5 | File de tâches asynchrones (Redis-backed)                                                                                |
| ioredis                 | ^5.10.1 | Client Redis                                                                                                             |
| jsonwebtoken            | ^9.0.3  | Génération et vérification JWT                                                                                           |
| bcryptjs                | ^3.0.2  | Hachage des mots de passe (pur JS, salt rounds: 12) — remplacé bcrypt en septembre 2026 pour corriger des vulnérabilités |
| multer                  | ^2.1.1  | Gestion de l'upload de fichiers (multipart/form-data)                                                                    |
| passport                | ^0.7.0  | Middleware d'authentification                                                                                            |
| passport-google-oauth20 | ^2.0.0  | Stratégie OAuth Google                                                                                                   |
| pdf-lib                 | ^1.17.1 | Manipulation PDF pure JS (fusion, split, ajout image, rotation, etc.)                                                    |
| sharp                   | ^0.34.2 | Traitement d'images (redimensionnement, conversion format) — utilisé par extractImages.js                                |
| pdf-parse               | ^2.4.5  | Extraction de texte brut depuis un PDF                                                                                   |
| archiver                | ^8.0.0  | Création d'archives ZIP                                                                                                  |
| helmet                  | ^8.1.0  | Sécurité des en-têtes HTTP                                                                                               |
| express-rate-limit      | ^8.5.2  | Limitation du taux de requêtes                                                                                           |
| cors                    | ^2.8.6  | Gestion CORS                                                                                                             |
| joi                     | ^18.3.4 | Validation des données entrantes                                                                                         |
| uuid                    | ^14.0.0 | Génération d'identifiants uniques pour les fichiers                                                                      |
| morgan                  | ^1.10.1 | Logging des requêtes HTTP                                                                                                |

#### Binaires système utilisés (via spawn/exec Node.js) :

- **Ghostscript** (`gs`) : compression PDF, conversion PDF↔images
- **LibreOffice** (`soffice`) : conversion documents bureautiques → PDF
- **QPDF** : protection/déprotection PDF par mot de passe (AES-256)

> ⚠️ Ces binaires doivent être installés sur le système d'exploitation. C'est pourquoi le déploiement sur des plateformes cloud gratuites (ex: Render Free) est impossible — elles ne permettent pas l'installation de binaires système.

### 5.2 Frontend — Dépendances principales

| Paquet                      | Version        | Rôle                                                       |
| --------------------------- | -------------- | ---------------------------------------------------------- |
| react                       | ^19.2.8        | Interface utilisateur                                      |
| vite                        | (devDep)       | Bundler et serveur de développement                        |
| tailwindcss                 | (devDep)       | Framework CSS utility-first                                |
| react-router-dom            | ^7.18.1        | Routage SPA                                                |
| zustand                     | ^5.0.14        | Gestion d'état global (en mémoire uniquement)              |
| axios                       | ^1.18.1        | Client HTTP avec intercepteurs JWT                         |
| react-pdf                   | ^10.4.1        | Rendu et visualisation de documents PDF dans le navigateur |
| react-signature-canvas      | ^1.1.0-alpha.2 | Canvas de dessin pour la signature manuscrite              |
| @hello-pangea/dnd           | ^18.0.1        | Drag & Drop (réorganisation des fichiers images dans l'outil « Images → PDF ») |
| lucide-react                | ^1.25.0        | Bibliothèque d'icônes SVG                                  |
| react-intersection-observer | ^11.0.0        | Animations d'apparition au scroll                          |

---

## 6. Système d'Authentification

### 6.1 Double mécanisme d'authentification

**Authentification classique (email + mot de passe) :**

1. L'utilisateur s'inscrit — le mot de passe est haché avec **bcryptjs** (facteur de coût: 12).
2. À la connexion, le serveur génère deux tokens JWT :
   - **Access Token** (durée: 15 minutes) — contient `id`, `email`, `nom_complet`, `plan`
   - **Refresh Token** (durée: 7 jours) — contient uniquement l'`id`
3. Les tokens sont stockés **en mémoire React** (Zustand), jamais en `localStorage` ni `sessionStorage`.
4. L'Access Token est automatiquement renouvelé via le Refresh Token avant son expiration (intercepteur Axios).

**Authentification OAuth Google :**

- Implémentée via Passport.js + `passport-google-oauth20`.
- Flux : redirection vers Google → callback → génération des mêmes JWT → retour vers le frontend.
- Si l'utilisateur Google n'existe pas en base, il est créé automatiquement.

### 6.2 Sécurité du routage frontend

- Toutes les routes de l'application authentifiée sont protégées par un composant `ProtectedRoute`.
- Si aucun token valide n'est en mémoire, l'utilisateur est redirigé vers `/login`.
- Les messages d'erreur de connexion sont toujours vagues : "Email ou mot de passe incorrect".

---

## 7. Gestion des Fichiers

### 7.1 Cycle de vie d'un fichier

```
Upload → Traitement → Résultat disponible → Téléchargement
                                                  │
        (le fichier reste accessible tant que l'utilisateur ne le supprime pas)
```

1. **Upload :** Envoyé via `multipart/form-data`, validé (type MIME, taille max 50 Mo), sauvegardé avec nom UUID aléatoire dans `./tmp/uploads/`.
2. **Référencement :** Enregistrement créé dans la table `files` avec ID propriétaire, nom original, chemin de stockage, type MIME.
3. **Traitement :** Tâche soumise à Bull Queue. Le Worker traite de façon asynchrone et met à jour le statut.
4. **Résultat :** Fichier de sortie stocké dans `./tmp/uploads/` avec nouvel UUID. URL de résultat retournée au frontend.
5. **Téléchargement :** Le frontend poll le statut toutes les 2 secondes. **Le fichier N'EST PAS supprimé après téléchargement** — il reste accessible.

**Déclencheurs réels de suppression :**

- **Annulation d'import :** `cancelCurrentFile()` → `DELETE /files/:id`
- **Suppression manuelle :** Depuis "Fichiers récents" ou "Mes fichiers" → `DELETE /files/:id`
- **Déconnexion :** Modale d'avertissement → `DELETE /files/all` (purge totale) → révocation JWT
- **Erreur à l'upload :** Nettoyage automatique côté serveur

> ⚠️ **Pour le mémoire :** La philosophie Privacy-First se traduit par l'information claire fournie à l'utilisateur (modale de déconnexion) et la purge totale à la déconnexion — pas par une suppression automatique post-téléchargement.

### 7.2 Validation des formats à l'upload

Le middleware `uploads.js` valide le type MIME ET l'extension selon l'outil actif :

- **PDF-only :** fusion, division, rotation, compression, protection, filigrane, signature, extraction texte, suppression/ajout de pages
- **Images :** `.jpg`, `.jpeg`, `.png`, `.bmp`, `.gif`, `.tiff` → outil "Images vers PDF"
- **Bureautique :** `.docx`, `.xlsx`, `.pptx` → outil "Office vers PDF"

Si le format est incompatible, le composant `FileFormatError.jsx` affiche un message ciblé et propose une redirection vers l'outil approprié.

---

## 8. Traitement Asynchrone (Bull Queue)

### 8.1 Architecture

```
API Express (port 3001)
        │
        │ [crée un Job en BDD + l'ajoute à la Queue Redis]
        ▼
    Bull Queue (Redis)
        │
        │ [dépile et exécute]
        ▼
    pdfWorker.js
        │
        │ [exécute le service PDF approprié]
        ▼
    Résultat sauvegardé sur disque + statut Job mis à jour
```

### 8.2 Opérations disponibles dans le Worker

| `type_operation`        | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `compress`              | Compression PDF via Ghostscript                     |
| `merge`                 | Fusion de plusieurs PDF via pdf-lib                 |
| `split`                 | Division d'un PDF en sous-documents                 |
| `rotate`                | Rotation des pages sélectionnées                    |
| `protect`               | Protection par mot de passe AES-256 (QPDF)          |
| `unprotect`             | Déprotection d'un PDF                               |
| `watermark`             | Ajout de filigrane texte                            |
| `sign`                  | Apposition d'une signature sur une page             |
| `remove_pages`          | Suppression de pages sélectionnées                  |
| `add_blank_pages`       | Insertion de pages vierges                          |
| `reorder_pages`         | Réorganisation des pages par glisser-déposer        |
| `extract_pages`         | Extraction de pages spécifiques (alias split/single) |
| `extract_images`        | Extraction des images embarquées (XObject)          |
| `add_image`             | Incrustation d'une image sur une ou plusieurs pages |
| `convert_to_pdf`        | Conversion bureautique → PDF (LibreOffice)          |
| `pdf_to_images`         | Conversion PDF → images (Ghostscript/rasterisation) |
| `pdf_to_txt`            | Extraction du texte brut (pdf-parse)                |
| `clean_metadata`        | Suppression des métadonnées du PDF                  |
| `convert_images_to_pdf` | Assemblage d'images en PDF (pdf-lib) — ajouté en S5 |

### 8.3 Priorité selon le plan d'abonnement

- Utilisateurs **Pro** : priorité 1 (traités en premier)
- Utilisateurs **Essai/Gratuit** : priorité 10 (traités après les Pro)

### 8.4 Polling du statut côté frontend

Le frontend interroge `GET /api/jobs/:id` toutes les 2 secondes jusqu'à `completed` ou `failed`. Barre de progression animée.

---

## 9. Fonctionnalités PDF en Détail

### 9.1 Fusion (merge)

Assemblage de plusieurs PDF dans l'ordre fourni. Implémenté avec `pdf-lib`.

### 9.2 Division (split)

Extraction de sous-ensembles de pages (syntaxe: "1-3, 7, 12-15"). ZIP si plusieurs fichiers. `pdf-lib` + `parsePages.js`.

### 9.3 Rotation

Rotation de pages individuelles ou tout le document (90°, 180°, 270°). `pdf-lib`.

### 9.4 Compression

Réduction du poids via Ghostscript. Niveaux : screen, ebook, printer, prepress. Un fichier de 8+ Mo peut prendre plusieurs dizaines de secondes — comportement normal lié à la profondeur d'analyse de Ghostscript.

### 9.5 Protection/Déprotection

- Protection : chiffrement AES-256 avec mot de passe via QPDF.
- Déprotection : retrait du mot de passe via QPDF (le mot de passe original doit être fourni).

### 9.6 Filigrane (Watermark)

Texte en superposition diagonale ou centrée. Position, taille, couleur, opacité configurables. `pdf-lib`.

### 9.7 Suppression de pages

Validation que le résultat a au moins 1 page. `pdf-lib`.

### 9.8 Ajout de pages vierges

Insertion au début, à la fin ou après un numéro de page spécifique. `pdf-lib`.

### 9.9 Réorganisation des pages (Drag & Drop) — *ajouté post-audit du 22/09/2026*

Fonctionnalité prévue au CDC (Module 2, priorité haute) et implémentée suite à l'audit d'intégrité du document mémoire.

**Backend** : `reorderPages.js` — recçoit un tableau `nouvelOrdre` (1-indexed), reconstruit le PDF page par page avec `pdf-lib`. Validations : tableau non vide, longueur égale à `totalPages`, pas de doublon, chaque index dans [1..n], ordre différent de l'original.

**Codes d'erreur** : `ORDRE_IDENTIQUE`, `ORDRE_INVALIDE`, `PAGE_INVALIDE:N`, `FICHIER_INTROUVABLE`

**Frontend** : `PageReorderViewer.jsx` — visualiseur autonome (distinct de `PdfThumbnailViewer`) avec :
- `DragDropContext` + `Droppable` + `Draggable` de `@hello-pangea/dnd`
- Vignettes `react-pdf`, badges position originale / position actuelle (amber si modifiée)
- Slider de zoom (100–220 px), bouton « Remettre l'ordre d'origine »
- `ReorderOptions.jsx` : indicateur « Ordre modifié » / « Ordre original », aperçu du nouvel ordre
- Bouton **désactivé** si aucune page n'a été déplacée

**Clé d'intégration** : flag `usesReorderViewer: true` dans `tools.js` pour distinguer du flux `PdfThumbnailViewer`. `ToolWorkspaceLayout` détecte ce flag et rend `PageReorderViewer` à la place. L'état `pageOrder` est partagé entre le viewer et `ReorderOptions` via props.

### 9.9.1 Extraction de pages — *ajouté post-audit du 22/09/2026*

Fonctionnalité prévue au CDC (Module 2) et implémentée en même temps que la réorganisation.

**Distinction avec la Division (`split`)** :

| | Division | Extraction |
|---|---|---|
| Intention | Couper en segments | Conserver des pages spécifiques |
| Modes | Single + Séparé (ZIP) | Single uniquement |
| Backend | `splitService` | `splitService(mode='single')` — alias |
| Route outil | `/tools/split` | `/tools/extract_pages` |

**Backend** : `extract_pages` est un alias sémantique de `split/single`. Le worker délègue directement à `splitService(..., 'single')`. Aucun nouveau service créé.

**Frontend** : `ExtractPagesOptions.jsx` — panneau simplifié sans choix de mode, orienté « pages à conserver ». Utilise `PdfThumbnailViewer` (mode multiple/blue, identique à `remove_pages`). Note informative distinguant cet outil de « Diviser ».

### 9.10 Conversion bureautique → PDF

`.docx`, `.xlsx`, `.pptx` via LibreOffice headless (`soffice --headless --convert-to pdf`).

### 9.11 Images → PDF (ajouté S5)

Assemblage de 1 à 20 images (JPEG, PNG, TIFF, BMP, GIF) en un seul document PDF.

- Chaque image occupe une page
- Options : format (A4/Letter), orientation (auto/portrait/paysage), marges (aucune/petite/grande)
- En mode "auto", l'orientation de chaque page s'adapte à l'image
- Réorganisation par D&D dans `MultiFileSelection.jsx`
- Implémenté avec `pdf-lib` uniquement (pas de Ghostscript)

### 9.12 PDF → Images

Rasterisation des pages via Ghostscript.

### 9.13 PDF → Texte (TXT)

Extraction du texte brut via `pdf-parse`. Résultat : fichier `.txt`.

### 9.14 Extraction d'images embarquées

**Fonctionnalité réservée aux abonnés Pro.**

Extrait les images nativement embarquées dans le PDF (objets XObject — pas une rasterisation de page).

Options disponibles :

- **Taille originale** (défaut)
- **Dimensions personnalisées** : largeur/hauteur en pixels, verrouillage du ratio. Aperçu dynamique des proportions en temps réel.
- **Raccourcis HD** : HD (1280×720), Full HD (1920×1080), 4K (3840×2160), A4 300DPI (2480×3508)
- **Format de sortie** : Original / PNG (sans perte) / JPG (qualité 92%)
- **Périmètre** : toutes les pages ou pages sélectionnées
- **Résultat** : ZIP si plusieurs images, fichier direct si une seule

Implémenté avec `pdf-lib` (parcours XObject) + `sharp` (redimensionnement/conversion).

> Note : Extraire un grand nombre d'images simultanément est plus long que d'en extraire une seule — comportement attendu, proportionnel au volume traité.

### 9.15 Ajout d'image sur PDF

Incrustation d'une image (PNG ou JPG, max 5 Mo) sur une ou plusieurs pages.

Positionnement (refonte S5) :

- À l'import : **centrage automatique** (`x = (largeur_page - largeur_image) / 2`)
- Déplacement par **Drag & Drop** avec contraintes de bords (`PdfImageViewer.jsx`)
- Coordonnées affichées en **centimètres** en temps réel
- **Validation par page** : emplacement différent possible pour chaque page
- Mode hybride : pages sans placement validé → centrage auto au backend
- Redimensionnement via poignée d'angle + support tactile

### 9.16 Signature électronique simple

**Note juridique affichée dans l'UI :** Signature visuelle simple au sens de l'article 3(10) du règlement eIDAS. Pas de valeur juridique qualifiée ou avancée.

Modes de signature :

1. **Canvas de dessin** : dessin manuscrit à la souris/doigt via `react-signature-canvas`
2. **Import d'image** : chargement d'une PNG/JPG existante
3. **Texte calligraphique** : nom saisi rendu dans une fonte cursive

Fonctionnement :

- Positionnement par Drag & Drop sur prévisualisation (`react-pdf`)
- Choix de la page cible
- Disclaimer d'avertissement à la première utilisation (géré en `sessionStorage` par utilisateur)
- Disclaimer d'avertissement à la première utilisation (géré en `sessionStorage` par utilisateur)
- Option "ajouter la date" automatiquement sous la signature

### 9.17 Nettoyage de métadonnées (Clean Metadata)

Suppression des métadonnées internes du document (Titre, Auteur, Sujet, Mots-clés, Logiciel de création, etc.) dans une optique de confidentialité (Privacy-First).

**Fonctionnement technique (`cleanMetadata.js`) :**
Utilise `pdf-lib` pour écraser les champs de métadonnées classiques :
- `setTitle`, `setAuthor`, `setSubject`, `setProducer`, `setCreator` remis à vide (`''`).
- `setKeywords` vidé (`[]`).
- Dates de création et de modification falsifiées (réinitialisées à l'Epoch UNIX, 1er janvier 1970).

**Comment le tester ?**
1. Sur Windows, faites un clic droit sur un PDF > *Propriétés* > onglet *Détails*. Remplissez le champ "Auteur" ou "Titre" et enregistrez.
2. Uploadez ce PDF dans DocMaster et lancez l'outil de nettoyage.
3. Téléchargez le PDF résultant : les propriétés auront totalement disparu.

---

## 10. Système d'Abonnement et de Paiement

### 10.1 Plans disponibles

| Plan         | Accès                                    | Durée                                |
| ------------ | ---------------------------------------- | ------------------------------------ |
| Essai (free) | Tous les outils SAUF extraction d'images | 7 jours automatiques à l'inscription |
| Pro          | Tous les outils + traitement prioritaire | Mensuel (renouvelable)               |

### 10.2 Cycle de vie d'un abonnement

À chaque inscription, un enregistrement est automatiquement créé :

```sql
INSERT INTO abonnements (user_id, statut, plan, date_debut_essai, date_fin_essai)
VALUES ($1, 'essai', 'free', NOW(), NOW() + INTERVAL '7 days')
```

Statuts : `essai`, `actif`, `expire`, `annule`, `en_attente`.

Le middleware `checkSubscription.js` est désactivable via `PAYMENT_ENABLED=false` (développement local).

### 10.3 Intégration PayDunya (sandbox)

**État : intégration complète et validée en mode sandbox (test).**

PayDunya est la passerelle retenue — compatible Orange Money Mali, Moov Money (SAMA Money), Wave.

Flux implémenté :

1. `POST /api/payment/initiate` → URL de paiement PayDunya
2. Utilisateur paie sur la page PayDunya
3. PayDunya appelle `POST /api/payment/webhook` → activation plan Pro
4. `POST /api/payment/confirm-return` → confirmation complémentaire au retour

**Pourquoi le mode live n'est pas activé :**
La réception de webhooks PayDunya nécessite une URL publique (serveur accessible sur Internet). Les binaires système (Ghostscript, LibreOffice, QPDF) doivent être installés sur ce serveur, ce qui n'est pas possible sur les hébergements gratuits. Le mode live est conditionné au financement de l'infrastructure.

**Formulation recommandée pour le mémoire :** _"L'intégration de la passerelle PayDunya a été réalisée et validée en environnement sandbox, permettant de vérifier l'intégralité du flux transactionnel (initiation, paiement mobile money, réception webhook, activation du plan) sans transaction financière réelle. Le basculement en mode live est conditionné au déploiement de l'API sur une infrastructure de production adaptée."_

---

## 11. Sécurité

| Mécanisme                 | Implémentation                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------- |
| JWT en mémoire            | Tokens stockés uniquement dans Zustand (RAM), jamais dans localStorage/sessionStorage |
| Hachage mots de passe     | bcryptjs (pur JS), salt rounds = 12                                                   |
| Validation des entrées    | Joi pour la validation côté serveur                                                   |
| En-têtes de sécurité      | Helmet.js (X-Frame-Options, CSP, HSTS, etc.)                                          |
| Rate limiting             | express-rate-limit sur routes sensibles (auth, paiement) — 20 req/min/IP              |
| CORS                      | Configuré pour n'accepter que l'origine du frontend                                   |
| Vérification propriétaire | Chaque accès fichier vérifie `owner_id = user_id`                                     |
| Chemins disque            | Jamais exposés au frontend ; seul l'UUID du fichier est transmis                      |
| Messages d'erreur auth    | Toujours vagues ("Email ou mot de passe incorrect")                                   |
| Protection AES-256        | Via QPDF pour le chiffrement des PDF                                                  |

**Bilan de sécurité npm (septembre 2026) :**
Après audit et corrections : 17 vulnérabilités initiales réduites à 2 modérées restantes (sans fix safe disponible — `uuid` via `bull` et `sharp`/`libvips`).

---

## 12. Interface Utilisateur — Points Notables

- **Mode sombre/clair** : hook `useTheme`, classe CSS sur `<html>`, persisté en `localStorage`
- **Design system** : tokens CSS personnalisés (Material Design 3 adapté), palette indigo/dorée
- **Navigation** : SPA à onglets (`useState`), pas de routes séparées par module outil
- **Notifications** : Toasts (succès, erreur, info, warning) via `ToastContext`
- **Fichiers récents** : tableau de bord avec vue liste/grille et animations
- **Responsive** : tiroir latéral (drawer) pour les options sur petits écrans
- **Déconnexion sécurisée** : modale d'avertissement avant purge des fichiers + révocation JWT

---

## 13. Tests des API (Requestly API Client)

### 13.1 Outil utilisé

Les API ont été testées avec **Requestly API Client** (équivalent Postman, utilisé tout au long du développement). Toutes les collections de tests sont disponibles dans Requestly.

### 13.2 Périmètre des tests réalisés

Les tests couvrent les catégories suivantes. **Pour compléter le chapitre 6 du mémoire avec des chiffres réels, l'auteur doit exporter depuis Requestly les statistiques exactes** (nombre de requêtes, dates, taux de succès) :

| Catégorie        | Endpoints testés                                                                              | Cas nominaux | Cas d'erreur                                              |
| ---------------- | --------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------- |
| Authentification | POST /auth/register, POST /auth/login, POST /auth/refresh, GET /auth/me, POST /auth/logout    | ✅           | ✅ (mauvais mdp, token expiré, email déjà utilisé)        |
| OAuth Google     | GET /auth/google, GET /auth/google/callback                                                   | ✅           | —                                                         |
| Fichiers         | POST /files/upload, GET /files, GET /files/download/:id, DELETE /files/:id, DELETE /files/all | ✅           | ✅ (format invalide, fichier trop grand, UUID inexistant) |
| Jobs PDF         | POST /api/jobs (toutes les 17 opérations), GET /api/jobs/:id, GET /api/jobs                   | ✅           | ✅ (PDF protégé, pages hors bornes, fichier corrompu)     |
| Paiement         | POST /api/payment/initiate, POST /api/payment/webhook, GET /api/payment/status                | ✅ (sandbox) | ✅ (signature invalide, plan inexistant)                  |

### 13.3 Anomalies rencontrées et corrigées (connues)

> Pour un bilan chiffré complet, l'auteur doit compléter cette liste depuis l'historique Requestly.

Anomalies documentées depuis les discussions projet :

- **Suppression post-téléchargement incorrecte** : La documentation initiale indiquait à tort que les fichiers étaient supprimés après téléchargement. Corrigé dans la documentation — le comportement réel (conservation jusqu'à action explicite) a été confirmé dans le code.
- **Opération `convert_images_to_pdf` absente de la liste blanche** : `OPERATIONS_VALIDES` dans `jobs.controller.js` ne contenait pas `convert_images_to_pdf`, causant une erreur "Opération invalide". Corrigé en septembre 2026.
- **`sharp` supprimé par erreur** : Lors de la correction des vulnérabilités npm, `sharp` a été retiré en tant que dépendance transitive, cassant le worker. Réinstallé comme dépendance directe.

### 13.4 Contraintes de performance observées (non-fonctionnelles)

Mesures approximatives en environnement local (Windows, i7, 16 Go RAM) :

| Opération                | Fichier test     | Temps observé           | Remarque                         |
| ------------------------ | ---------------- | ----------------------- | -------------------------------- |
| Compression              | ~8 Mo            | ~20-40s                 | Ghostscript CPU-intensif, normal |
| Extraction 1 image       | PDF standard     | < 2s                    | Rapide                           |
| Extraction toutes images | PDF multi-images | Proportionnel au nombre | Normal                           |
| Fusion 2 PDF             | Petits fichiers  | < 3s                    | Dans les SLA du CDC              |
| Images → PDF (3 images)  | JPEG standard    | < 5s                    | pdf-lib pur JS                   |

---

## 14. Infrastructure de Développement : Docker

Les services d'infrastructure sont gérés via **Docker Compose** :

### 14.1 Services Docker

**PostgreSQL (version 16)**

- Image : `postgres:16` (version fixe)
- Port exposé : `5434:5432` (hôte 5434 → conteneur 5432)
- Volume persisté : `postgres_data`

**Redis (version 7-alpine)**

- Image : `redis:7-alpine` (~30 Mo, Alpine Linux)
- Port exposé : `6379:6379`
- Persistance activée : `--appendonly yes` (jobs Bull Queue survivent au redémarrage)
- Volume persisté : `redis_data`

> **Note pour le mémoire :** Docker ne conteneurise pas l'application Node.js elle-même — il fournit uniquement les services d'infrastructure (BDD + cache) de façon portable.

---

## 15. Ce qui N'est PAS dans le Périmètre

> Ne jamais mentionner ces éléments comme étant implémentés ou planifiés à court terme.

- ❌ Mode visiteur (accès sans compte)
- ❌ Paiement en mode live (conditionné au déploiement)
- ❌ Intégration cloud (Google Drive, Dropbox)
- ❌ Extension navigateur
- ❌ Application mobile native
- ❌ Conversion PDF → Word haute fidélité
- ✅ **Réorganisation des pages d'un PDF par Drag & Drop** — implémentée le 22/09/2026 (voir §9.9)
- ❌ Signature électronique qualifiée (eIDAS niveau avancé ou qualifié)
- ❌ OCR (reconnaissance optique de caractères)
- ❌ Tests unitaires automatisés (prévu au CDC, non réalisé)
- ❌ Documentation Swagger/OpenAPI (remplacée par Markdown)
- ❌ Hébergement en production (application fonctionne en local)

---

## 16. Décisions Architecturales Importantes

| Décision                                   | Raison                                                                                                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Traitement asynchrone (Bull Queue)         | Les opérations PDF peuvent prendre plusieurs secondes. Traitement synchrone bloquerait le serveur HTTP.                                                          |
| pdf-lib pour la manipulation PDF           | Pur JavaScript, pas de dépendance à des binaires. Fiable et maintenu.                                                                                            |
| Ghostscript pour la compression            | Référence industrielle. Qualité et compression inégalées.                                                                                                        |
| LibreOffice pour la conversion bureautique | Seule solution open-source fiable pour .docx/.xlsx/.pptx → PDF.                                                                                                  |
| JWT en mémoire uniquement                  | Prévention XSS : une faille XSS ne peut pas voler le token s'il n'est pas dans le DOM storage.                                                                   |
| Suppression contrôlée des fichiers         | Privacy-First : la plateforme informe l'utilisateur et purge à la déconnexion.                                                                                   |
| bcryptjs à la place de bcrypt              | bcrypt (C++ natif) avait une chaîne de vulnérabilités (tar CRITICAL). bcryptjs est pur JS, API identique, légèrement plus lent mais imperceptible en production. |
| Pas de TanStack Query                      | Non introduit sans validation explicite du tuteur. Gestion via Axios + Zustand.                                                                                  |

---

## 17. État du Déploiement (à mettre à jour pour le chapitre 7)

**État actuel (septembre 2026) : application 100% locale, pas de déploiement.**

L'application fonctionne en local avec :

- Backend sur `http://localhost:3001`
- Frontend sur `http://localhost:5173`
- PostgreSQL via Docker sur port `5434`
- Redis via Docker sur port `6379`

**Ce qui bloque le déploiement :**

1. Installation des binaires système (Ghostscript, LibreOffice, QPDF) requise sur le serveur
2. Les formules gratuites (Render Free, Railway Free) ne permettent pas ces installations
3. Les formules payantes nécessitent un budget non encore disponible

**Pistes étudiées et abandonnées :**

- Render.com Free : pas de workers persistants, binaires impossibles
- Vercel : serverless uniquement, incompatible avec les workers longs

**Formulation pour le chapitre 7 (conditionnel) :**
_"Le déploiement en production n'a pas pu être effectué dans le cadre de ce projet, en raison des contraintes liées aux binaires système nécessaires au traitement PDF. L'application est démontrée en environnement local lors de la soutenance."_

> ⚠️ **Ce bloc doit être mis à jour si un déploiement effectif a lieu avant la soutenance.**

---

## 18. Améliorations Post-S5 — Session du 21 Septembre 2026

> Cette section documente les corrections et améliorations de robustesse apportées après la livraison S5, lors d'une session d'audit et de polish avant soutenance.

### 18.1 Audit et cartographie des codes d'erreur backend

**Problème identifié :** `JobTracker.jsx` ne mappait que 11 codes d'erreur sur les 30+ que le backend peut émettre. Les autres codes arrivaient bruts à l'utilisateur (ex: `TOUTES_LES_PAGES_SUPPRIMEES`, `FICHIER_SIGNATURE_INTROUVABLE`, `PAGE_HORS_BORNES:5,total=3`).

**Correction :** Extension de `MESSAGES_ERREUR` (codes statiques) et de `parseRawError` (codes dynamiques à payload) dans `JobTracker.jsx`.

Codes statiques ajoutés : `TOUTES_LES_PAGES_SUPPRIMEES`, `SELECTION_INVALIDE`, `SELECTION_VIDE`, `AUCUNE_PAGE_SELECTIONNEE`, `AUCUNE_PAGE_FUSIONNEE`, `FICHIER_RESULTAT_MANQUANT`, `PROTECTION_ECHOUEE`, `AUCUN_TEXTE_EXTRAIT`, `AUCUNE_IMAGE_GENEREE`, `FICHIER_PDF_INTROUVABLE`, `FICHIER_SIGNATURE_INTROUVABLE`, `FORMAT_SIGNATURE_NON_SUPPORTE`, `COMPRESSION_INEFFICACE`, etc.

Codes dynamiques ajoutés dans `parseRawError` : `PAGE_INVALIDE:N`, `PAGE_HORS_BORNES:N,total=X`, `PLAGE_INVERSEE:segment`, `SYNTAXE_INVALIDE:segment`, `ECHEC_EXTRACTION_TEXTE:msg`, `ECHEC_RASTERISATION:page=N`, `ECHEC_ARCHIVAGE:msg`, `INTEGRATION_SIGNATURE_ECHOUEE:msg`, `PROTECTION_ECHOUEE:msg`, `FORMAT_INVALIDE:X`.

**Résultat :** L'utilisateur reçoit désormais un message en français clair et actionnable pour tout code d'erreur connu du backend.

### 18.2 Correction bug compression — violation contrainte unique BDD

**Problème :** Quand Ghostscript ne réduit pas la taille d'un PDF (fichier déjà optimisé), `compress.js` retournait `nomStockage = path.basename(chemin)` — l'UUID du fichier source, déjà présent dans la table `files`. Le `pdfWorker` tentait de l'insérer à nouveau → erreur `duplicate key value violates unique constraint "files_nom_stockage_key"` → crash du job.

**Correction (backend — `compress.js` + `pdfWorker.js`) :**

1. `compress.js` copie maintenant le fichier source sous un **nouveau UUID** (`fs.copyFileSync`) lorsque la compression est inefficace.
2. Un flag `avertissement: 'COMPRESSION_INEFFICACE'` est inclus dans le retour du service.
3. `pdfWorker.js` stocke ce flag dans la colonne `erreur_message` (colonne existante, non modifiée) même quand `statut = 'done'` — sans nouvelle colonne BDD.
4. `typeMime: 'application/pdf'` ajouté dans les deux chemins de retour de `compress.js` (était manquant — nécessaire pour déterminer l'extension du fichier résultat côté worker).

**Principe d'architecture :** Réutilisation de `erreur_message` comme champ informatif pour les cas ambigus (résultat « succès sans effet »), distingué du cas erreur par `statut === 'done' && erreur_message === 'COMPRESSION_INEFFICACE'`.

### 18.3 UX compression inefficace — messages adaptés en cascade

**Problème :** Même après la correction du crash, l'utilisateur recevait un toast « Compression terminée avec succès » et un checkmark vert — trompeurs car aucune réduction n'avait eu lieu.

**Correction en cascade sur 4 composants :**

| Composant             | Avant                                  | Après                                                                         |
| --------------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| `ToolWorkspaceLayout` | `toast.success("terminé avec succès")` | `toast.warn("Votre PDF est déjà optimisé — aucune réduction possible")`       |
| `ResultCard`          | Icône ✅ verte + stats 0% trompeuses   | Icône ⚠️ orange + message explicatif + stats masquées                         |
| `JobTracker`          | Notification `success`                 | Notification `warning` avec titre « PDF déjà optimisé »                       |
| `NotificationDrawer`  | Seuls `success` et `error` gérés       | Support complet du type `warning` (icône orange, bouton Télécharger maintenu) |

Le fichier original reste toujours téléchargeable — seul le message change.

### 18.4 Correction encodage UTF-8 — SignOptions.jsx

**Problème :** Les caractères accentués dans `SignOptions.jsx` (ex: « Épaisseur du trait ») apparaissaient sous forme de séquences corrompues en production Vite. La corruption avait été introduite lors d'une édition avec PowerShell `Set-Content -Encoding UTF8` qui ajoute un BOM (Byte Order Mark) — incompatible avec Vite.

**Correction :** Restauration du fichier depuis le commit git propre original via Node.js (`execSync('git show d69885b:...')` + `fs.writeFileSync` sans BOM) — garantissant UTF-8 sans BOM.

**Règle retenue :** Pour les fichiers JSX avec caractères accentués, utiliser uniquement l'éditeur de code ou Node.js — jamais `PowerShell Set-Content` (ajoute BOM).

### 18.5 Harmonisation dark mode — suppression des couleurs fixes claires

**Problème :** Plusieurs composants utilisaient des classes Tailwind avec des teintes très claires (`bg-amber-50`, `bg-green-100`, `bg-blue-50`) sans variante `dark:`. Ces couleurs apparaissent quasi blanches en mode sombre, rendant les messages d'avertissement invisibles.

**Correction :** Remplacement systématique dans `SignOptions.jsx`, `UnprotectOptions.jsx`, `DropZone.jsx` par des couleurs avec transparence alpha (`bg-amber-500/10`, `bg-green-500/15`, `bg-primary/10`) qui s'adaptent naturellement aux deux modes.

**Standard désormais appliqué :** `bg-{couleur}-500/{opacité}` plutôt que `bg-{couleur}-50` pour toutes les boîtes colorées du projet.

### 18.6 Mention eIDAS permanente dans l'outil Signature

**Problème :** Le disclaimer eIDAS n'était affiché qu'une fois à l'entrée de l'outil (`sessionStorage`). Une fois accepté, aucune mention n'était visible dans le panneau de configuration — en contradiction avec les règles du projet (AGENTS.md : « rappeler dans l'UI que ce n'est pas une signature eIDAS certifiée »).

**Correction :** Ajout d'une mention permanente et discrète dans `SignOptions.jsx` :

> _Signature électronique simple — non certifiée eIDAS. Elle n'a pas de valeur légale probante sans accord contractuel préalable._

**Justification technique pour le mémoire :** L'article 3(10) du règlement eIDAS définit la « signature électronique simple » comme « des données sous forme électronique, jointes ou associées logiquement à d'autres données sous forme électronique, et que le signataire utilise pour signer ». L'application docmaster implémente exactement ce niveau (niveau 1 sur 3), ce qui est conforme pour les usages internes non réglementés mais doit être explicitement mentionné dans l'UI.

### 18.7 Correction du crash "Detached ArrayBuffer" (react-pdf)

**Problème :** Lors de la tentative d'ouverture d'un PDF protégé, un écran blanc apparaissait après la saisie du mot de passe dans l'interface de visualisation (réorganisation, extraction, etc.). L'erreur console indiquait `Cannot perform Construct on a detached ArrayBuffer`.
**Cause :** Lors de son premier passage, `react-pdf` "détachait" la mémoire (`ArrayBuffer`) du PDF pour l'envoyer à son Web Worker. Après la saisie du mot de passe, l'UI demandait à `react-pdf` de re-charger le document, mais lui fournissait le même buffer mémoire (désormais vide/détaché), provoquant un crash silencieux et une page blanche.
**Correction :** Les visualiseurs (`PdfThumbnailViewer` et `PageReorderViewer`) conservent désormais l'`ArrayBuffer` original en référence, et passent systématiquement une **copie** de la mémoire (`buffer.slice(0)`) à `react-pdf`. Ainsi, après la saisie du mot de passe, un nouveau clone sain de la mémoire est fourni, permettant au Worker de déchiffrer et d'afficher le document avec succès.

### 18.7 Validation de position dans « Ajouter des pages vierges »

**Problème :** Le champ « Position (après la page n°) » ne limitait pas l'utilisateur au nombre réel de pages du PDF — il était possible de saisir 999 sur un document de 3 pages, ce qui causait une erreur backend cryptique `POSITION_INVALIDE:999`.

**Correction :** Le composant `AddBlankPagesOptions.jsx` charge silencieusement le nombre de pages via un hook `usePdfPageCount` (requête PDF.js en arrière-plan, sans afficher de visualiseur PDF). Ce nombre alimente :

- L'attribut `max` du champ numérique
- Un clamping automatique à la perte de focus
- Un message explicatif si la valeur dépasse le total

**Choix architectural :** Pas de visualiseur PDF dans cet outil (options de position — début/fin/après page N — sont suffisamment claires). Le hook charge uniquement les métadonnées, pas le rendu visuel.

### 18.8 Commits de référence (session du 21/09/2026)

| Hash      | Description                                                                       |
| --------- | --------------------------------------------------------------------------------- |
| `98776ad` | fix: validation pages vierges, messages erreur, dark mode, harmonisation Register |
| `7e92dd9` | fix: audit complet — 25+ codes erreur, dark mode, eIDAS, encodage, compress       |
| `26707a6` | fix(compress): UX adaptée quand compression sans effet (warning en cascade)       |

---

## 20. Corrections et Améliorations — Session du 22 Septembre 2026

> Cette section documente les corrections apportées lors de la session d'après-midi du 22 septembre 2026, portant principalement sur la stabilisation des nouveaux outils (réorganisation, extraction de pages) et l'expérience utilisateur globale.

### 20.1 Outil « Réorganiser les pages » — Stabilisation complète

#### 20.1.1 Bugs corrigés

| Bug | Cause racine | Correction |
|---|---|---|
| `Cannot perform Construct on a detached ArrayBuffer` | Chaque `PageCard` instanciait son propre `<Document>` react-pdf — le buffer ArrayBuffer était détaché après le premier chargement | Suppression des `<Document>` imbriqués ; les `<Page>` utilisent le contexte du `<Document>` parent unique |
| `MOT_DE_PASSE_INCORRECT` sur des PDFs sans mot de passe | `pdfWorker.js` passait `motDePassePdf` à `reorderPagesService` alors que le fichier était **déjà déchiffré** par qpdf (ligne 86-90) du worker | Suppression du 3e argument dans l'appel à `reorderPagesService` |
| `Cannot read properties of null (reading 'ignoreEncryption')` | `reorderPages.js` appelait `loadPdf(pdfBytes, motDePasse)` en passant le mot de passe brut comme `opts` (un objet attendu) ; `null` transmis directement causait `null.ignoreEncryption` dans pdf-lib | Appel corrigé : `loadPdf(pdfBytes, motDePasse ? { password: motDePasse } : {})` + détection d'erreur par code `PDF_CHIFFRE` |
| `Cannot update a component (ToolWorkspaceLayout) while rendering PageReorderViewer` | `onOrderChange` appelé directement dans `handleLoadSuccess` (pendant le rendu react-pdf) déclenchait un setState sur le parent | `setTimeout(() => { onOrderChange(...); }, 0)` pour différer hors du cycle React |
| Droppable nested scroll container warning | `@hello-pangea/dnd` avec `direction="horizontal"` incompatible avec les scroll containers imbriqués | Remplacement par **HTML5 DnD natif** — aucune dépendance externe, compatible avec tous les layouts |

#### 20.1.2 Architecture finale de `PageReorderViewer`

- **Drag & Drop** : HTML5 DnD natif (`draggable`, `onDragStart`, `onDragEnter`, `onDragOver`, `onDrop`, `onDragEnd`). Plus de `@hello-pangea/dnd`.
- **Lazy loading** : Pattern identique à `PdfThumbnailViewer` — un seul `IntersectionObserver` global (`observerRef`) + map de refs DOM (`sentinelRefs`), `visiblePages` Set pilotant l'affichage.
- **Stratégie "once-visible-always-visible"** : Une page ajoutée au Set `visiblePages` n'en est jamais retirée. Évite le rechargement des vignettes au scroll ou au changement de taille — essentiel pour un PDF de grande taille où le rechargement serait perceptible.
- **Progression** : Composant `LoadingProgress` identique à `PdfThumbnailViewer` (barre de progression + compteur `{loaded} / {total} pages`).
- **Grille** : `grid auto-fill minmax(${thumbSize}px, 1fr)` — identique à `PdfThumbnailViewer`.
- **Encodage** : Fichier écrit via `write_to_file` (UTF-8 sans BOM) — jamais via PowerShell `Set-Content`.

#### 20.1.3 Fichiers modifiés

| Fichier | Rôle de la modification |
|---|---|
| `backend/src/services/pdf/reorderPages.js` | Correction appel `loadPdf` (opts objet, pas mot de passe brut) + try/catch avec code `PDF_CHIFFRE` |
| `backend/src/jobs/pdfWorker.js` | Suppression du 3e argument `motDePassePdf` dans le case `reorder_pages` |
| `frontend/src/components/workspace/viewer/PageReorderViewer.jsx` | Réécriture complète — HTML5 DnD, observer global, LoadingProgress, grille CSS |

### 20.2 Outil « Extraire des pages » (extract_pages)

- **Implémentation backend** : Alias sémantique de `splitService(mode='single')` — aucun service dédié, réutilisation de la logique existante.
- **Implémentation frontend** : Composant `ExtractPagesOptions.jsx` (sélection de pages via `PdfThumbnailViewer`) + entrée dans `tools.js` + `OPTIONS_MAP`.
- **UX** : L'utilisateur sélectionne les pages à conserver ; le résultat est un PDF unique contenant uniquement ces pages (contrairement au split standard qui peut générer un ZIP de plusieurs PDFs).

### 20.3 Scroll universel — Comportement harmonisé

**Problème identifié :** Le composant `ScrollToTop` dans `App.jsx` appelait `window.scrollTo({ top: 0, behavior: 'instant' })` sur chaque changement de `pathname`. Cependant :

1. Le navigateur peut restaurer automatiquement la position précédente via `history.scrollRestoration = 'auto'` (comportement par défaut des SPA modernes) — ce qui annule le scroll programmatique.
2. Les transitions d'étapes internes (`configuration → traitement → résultat`) ne changent pas la route, donc `ScrollToTop` ne se déclenchait pas.

**Corrections :**

| Où | Correction |
|---|---|
| `App.jsx / ScrollToTop` | `history.scrollRestoration = 'manual'` (désactive la restauration auto) + triple ciblage `window`, `document.documentElement`, `document.body` |
| `ToolWorkspaceLayout / handleStart` | `scrollTo(0,0)` ajouté quand `setStep('traitement')` |
| `ToolWorkspaceLayout / handleComplete` | `scrollTo(0,0)` ajouté quand `setStep('resultat')` |

### 20.4 Outil « Nettoyage des métadonnées » — Description et guide de test

#### Qu'est-ce que les métadonnées d'un PDF ?

Un PDF contient deux types de données : le contenu visible (texte, images, mise en page) et des **métadonnées invisibles** stockées dans l'en-tête du fichier. Ces métadonnées peuvent inclure :

- Nom de l'auteur du document
- Logiciel ayant créé le document (ex: `Microsoft Word 16.0`, `Adobe Acrobat Pro`)
- Dates de création et de dernière modification
- Titre, sujet, mots-clés saisis lors de l'enregistrement
- Nom de l'entreprise ou de l'organisation
- Versions successives du document (historique de révision dans certains formats)

#### Pourquoi les supprimer ?

| Cas d'usage | Risque sans nettoyage |
|---|---|
| **Partage externe** | L'auteur et l'organisation interne sont visibles par le destinataire |
| **Conformité RGPD** | Les noms de personnes physiques dans les métadonnées = données personnelles |
| **Sécurité** | Le nom du logiciel révèle la version — des attaquants peuvent cibler des failles connues de cette version |
| **Appel d'offres** | Un PDF de réponse peut révéler le nom de la société rédactrice avant délibération |

#### Ce que fait l'outil `clean_metadata`

Le service `cleanMetadataService` (backend, `cleanMetadata.js`) utilise **pdf-lib** pour :

1. Charger le PDF
2. Effacer les champs standard XMP et DocInfo : `Title`, `Author`, `Subject`, `Keywords`, `Creator`, `Producer`, `CreationDate`, `ModDate`
3. Sauvegarder un nouveau PDF avec ces champs vides

#### Comment tester proprement

**Méthode 1 — Navigateur (rapide)**
1. Ouvrez n'importe quel PDF généré depuis Word/LibreOffice dans votre navigateur (Chrome ou Firefox)
2. Clic droit → `Propriétés du document` (ou via le menu ≡ → Informations sur le document)
3. Notez les champs Author, Creator, Producer
4. Lancez l'outil sur ce PDF
5. Ouvrez le PDF résultat — les champs doivent être vides

**Méthode 2 — ExifTool (en ligne de commande, plus fiable)**
```bash
# Avant nettoyage
exiftool votre-document.pdf | grep -i "author\|creator\|producer\|title"

# Après nettoyage
exiftool resultat_clean_metadata.pdf | grep -i "author\|creator\|producer\|title"
```

**Méthode 3 — Windows Explorer**
- Clic droit sur le PDF → Propriétés → onglet Détails
- Les champs Titre, Objet, Auteur, Mots-clés doivent être vides après nettoyage

> **Note pour la soutenance :** L'outil `clean_metadata` est un outil de confidentialité — il ne modifie pas le contenu visible du PDF. Le fichier résultat est visuellement identique à l'original mais ne contient plus d'informations sur son auteur ou son processus de création.

### 20.5 Commits de référence (session du 22/09/2026 après-midi)

> À compléter après validation et commit final.

---

_Ce document doit être utilisé comme référence unique pour toute rédaction relative au projet PDF DocMaster. En cas de doute sur un aspect technique, il vaut mieux laisser une note plutôt qu'inventer._

**Dernière mise à jour :** 22 septembre 2026



> Cette section liste des pistes d'évolution identifiées en cours de projet, hors du CDC ou reportables après soutenance.

> [!NOTE]
> La réorganisation des pages (§9.9) et l'extraction de pages (§9.9.1) étaient initialement classées ici mais ont été **implémentées le 22 septembre 2026** suite à l'audit d'intégrité du document.

### 19.1 Autres évolutions identifiées (hors CDC)

> Ces points ne sont pas dans le CDC — toute implémentation doit faire l'objet d'une validation préalable.

| Évolution | Complexité estimée | Priorité suggérée |
|---|---|---|
| Aperçu du résultat avant téléchargement | Faible | Moyenne |
| Historique des jobs avec pagination | Faible | Moyenne |
| Export du profil et de l'historique (RGPD) | Moyenne | Basse |

---

_Ce document doit être utilisé comme référence unique pour toute rédaction relative au projet PDF DocMaster. En cas de doute sur un aspect technique, il vaut mieux laisser une note plutôt qu'inventer._

**Dernière mise à jour :** 22 septembre 2026
