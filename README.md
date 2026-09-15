# PDF DocMaster

**Projet de Licence Professionnelle — Génie Informatique et Télécommunications (G.I.T)**  
**École :** ENI-ABT (École Nationale d'Ingénieurs Abderhamane Baba TOURE)  
**Entreprise d'accueil :** Mali Développeur SARL  
**Auteur :** Abdoulaye Maiga — Semestre 5, 2025-2026

---

## Présentation

PDF DocMaster est une application web SaaS de gestion et manipulation de documents PDF. Elle permet aux particuliers, étudiants et professionnels maliens de traiter leurs fichiers PDF sans dépendre de services en ligne payants.

**Stack technique :**
- **Backend :** Node.js + Express + Bull Queue (Redis) + PostgreSQL
- **Frontend :** React.js + Vite + Tailwind CSS
- **Infrastructure locale :** Docker Compose (PostgreSQL 16 + Redis 7-alpine)

---

## Fonctionnalités

### Opérations PDF
| Outil | Description |
|-------|-------------|
| Fusion | Assembler plusieurs PDF en un seul |
| Division | Extraire des pages selon une sélection |
| Rotation | Faire pivoter des pages (90°, 180°, 270°) |
| Suppression de pages | Retirer des pages sélectionnées |
| Ajout de pages vierges | Insérer des pages vides (début / fin / position) |
| Réorganisation | Réordonner les pages par glisser-déposer |
| Compression | Réduire la taille via Ghostscript |
| Protection | Ajouter un mot de passe (AES-256) |
| Déprotection | Supprimer le mot de passe |
| Filigrane | Ajouter du texte en superposition |
| Ajout d'image | Incruster une image avec positionnement libre |
| Signature simple | Dessiner/importer/calligraphier + positionnement D&D |
| Nettoyage métadonnées | Supprimer les métadonnées PDF |

### Conversion
| Outil | Description |
|-------|-------------|
| Images → PDF | Assembler des images JPG/PNG en PDF |
| Office → PDF | Convertir .docx/.xlsx/.pptx via LibreOffice |
| PDF → Images | Rasteriser les pages via Ghostscript |
| PDF → TXT | Extraire le texte brut |
| Extraction d'images ⭐ | Extraire les images embarquées (Pro) |

⭐ Accès réservé aux abonnés Pro

### Authentification
- Inscription / Connexion classique (email + mot de passe)
- OAuth Google (Passport.js)
- JWT en mémoire uniquement (jamais localStorage)
- Période d'essai 7 jours à l'inscription

---

## Installation locale

### Prérequis

- Node.js 18+
- Docker Desktop
- LibreOffice (pour la conversion Office → PDF)
- Ghostscript (pour la compression et PDF → Images)
- QPDF (pour la déprotection PDF)

### 1. Infrastructure (Docker)

```bash
docker-compose up -d
# Lance PostgreSQL (port 5434) et Redis (port 6379)
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # Renseigner les variables
npm install
npm run dev            # API sur http://localhost:3000
```

Dans un second terminal :
```bash
cd backend
npm run worker         # Worker Bull Queue
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # App sur http://localhost:5173
```

---

## Variables d'environnement backend (`.env`)

```env
# Base de données
DATABASE_URL=postgresql://postgres:motdepasse@localhost:5434/docmaster-app

# JWT
JWT_SECRET=votre_secret_jwt
JWT_REFRESH_SECRET=votre_secret_refresh

# Redis
REDIS_URL=redis://localhost:6379

# Uploads
UPLOAD_DIR=./tmp/uploads

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# PayDunya (optionnel - désactiver avec PAYMENT_ENABLED=false)
PAYMENT_ENABLED=false
PAYDUNYA_MASTER_KEY=...
PAYDUNYA_PRIVATE_KEY=...
PAYDUNYA_TOKEN=...
PAYDUNYA_MODE=test
```

---

## Architecture

```
docmaster-app/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Contrôleurs Express
│   │   ├── jobs/            # Worker Bull Queue (pdfWorker.js)
│   │   ├── middlewares/     # Auth, uploads, rate-limit, subscription
│   │   ├── routes/          # Définition des routes
│   │   └── services/
│   │       ├── pdf/         # Services de traitement PDF (un fichier par opération)
│   │       └── *.service.js # Services métier (auth, jobs, payment)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── dashboard/   # Composants du tableau de bord
│       │   ├── layout/      # Header, Footer, Navigation
│       │   ├── ui/          # Composants génériques (modales, dialogues)
│       │   └── workspace/   # Espace de travail des outils PDF
│       │       ├── options/ # Panneaux d'options par outil
│       │       └── viewer/  # Visualiseurs PDF (miniatures, signature, image)
│       ├── data/            # Définition des outils (tools.js)
│       ├── hooks/           # Hooks personnalisés (useTheme)
│       ├── pages/           # Pages de l'application
│       ├── services/api/    # Clients API (axiosClient, paymentApi)
│       └── store/           # État global (Zustand)
├── docs/                    # Documentation technique
└── docker-compose.yml       # Infrastructure locale
```

---

## Documentation technique

Disponible dans le dossier [`docs/`](./docs/) :

| Fichier | Contenu |
|---------|---------|
| `docs/api/endpoints.md` | Tous les endpoints REST |
| `docs/api/payment.md` | Système d'abonnement + PayDunya |
| `docs/pdf/*.md` | Documentation de chaque opération PDF |
| `docs/frontend/securite-lifecycle.md` | Sécurité, JWT, cycle de vie fichiers |
| `docs/jobs/bullqueue.md` | File d'attente asynchrone Bull Queue |
| `docs/auth/README.md` | Authentification et OAuth |

---

## Sécurité

- JWT **jamais** en localStorage — stockage en mémoire Zustand uniquement
- `bcrypt` (rounds=12) pour les mots de passe
- `Helmet.js` pour les en-têtes HTTP sécurisés
- Rate limiting sur les routes sensibles (auth, paiement)
- Validation `Joi` sur toutes les entrées serveur
- Vérification `owner_id` sur chaque accès fichier
- Suppression explicite des fichiers à la déconnexion (Privacy-First)

---

## Paiement

Intégration **PayDunya en mode sandbox (test)** — Orange Money, Wave, Moov Money.  
Le mode live sera activé après déploiement sur infrastructure de production.  
Désactivable avec `PAYMENT_ENABLED=false` pour le développement local.

---

## Licence

Projet de fin de cycle — Licence Professionnelle G.I.T — ENI-ABT — 2025-2026
