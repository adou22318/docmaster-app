# Documentation des Points d'Accès API (Endpoints) — Semaine 3

**Semaine :** S3
**Statut :** ✅ Fonctionnel et Documenté
**Routes associées :** [jobs.routes.js](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/routes/jobs.routes.js), [files.routes.js](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/routes/files.routes.js)

---

## Authentification
Toutes les routes d'API ci-dessous (à l'exception de la route de santé publique) nécessitent un en-tête d'authentification Bearer Token :
`Authorization: Bearer <votre_jwt>`

---

## 1. Gestion des Fichiers (Files API)

### POST `/api/files/upload`
Permet d'uploader un fichier sur le serveur.
- **Form-Data** : `file` (fichier binaire PDF, JPG, PNG, DOCX, XLSX, PPTX).
- **Limite** : 50 Mo par fichier.
- **Réponse (201)** :
  ```json
  {
    "success": true,
    "message": "Fichier uploadé avec succès.",
    "data": {
      "id_files": "uuid-du-fichier",
      "nom_original": "document.pdf",
      "taille_octets": 102400,
      "type_mime": "application/pdf",
      "created_at": "2026-07-09T17:20:00Z"
    }
  }
  ```

### GET `/api/files/download/:id`
Permet de télécharger un fichier de résultat ou d'origine en utilisant son ID.
- **Paramètre** : `id` (UUID du fichier).
- **Réponse (200)** : Renvoie directement le fichier binaire au client avec son nom d'origine.

---

## 2. Traitement PDF (Jobs API)

### POST `/api/jobs`
Crée une tâche de traitement PDF et l'ajoute à la file d'attente asynchrone (Bull Queue).

- **Body JSON** :
  ```json
  {
    "type_operation": "merge | split | compress | protect | watermark | rotate",
    "fichiers": ["uuid-fichier-1", "uuid-fichier-2"],
    "options": {}
  }
  ```

- **Options spécifiques par opération** :

#### A. Fusion (merge)
- **Fichiers** : Tableau de 2 UUIDs minimum.
- **Options** : Non requises.
- **Exemple** :
  ```json
  {
    "type_operation": "merge",
    "fichiers": [
      "8073ea45-56be-43ad-8d3f-42a1ab9430c2",
      "2281a6c1-a20c-43f1-bd12-f2f2ac6c2b18"
    ]
  }
  ```

#### B. Division (split)
- **Fichiers** : Tableau contenant 1 seul UUID.
- **Options** :
  - `selection` (string, requis) : Syntaxe de sélection (ex: `"1-3, 5, 8"`).
  - `mode` (string, optionnel) : `'single'` (défaut, tout regrouper dans 1 PDF) ou `'separate'` (extraire en fichiers distincts, compressés en `.zip` si multiples).
- **Exemple** :
  ```json
  {
    "type_operation": "split",
    "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
    "options": {
      "selection": "1-2, 5",
      "mode": "separate"
    }
  }
  ```

#### C. Compression (compress)
- **Fichiers** : Tableau contenant 1 seul UUID.
- **Options** :
  - `niveau` (string, requis) : `'haute'` (72 DPI, fichier très léger), `'moyenne'` (150 DPI, standard), ou `'basse'` (300 DPI, haute qualité).
- **Exemple** :
  ```json
  {
    "type_operation": "compress",
    "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
    "options": {
      "niveau": "moyenne"
    }
  }
  ```

- **Réponse de création (201)** :
  ```json
  {
    "success": true,
    "message": "Job créé. Traitement en cours...",
    "data": {
      "id_jobs": "uuid-du-job",
      "type_operation": "split",
      "statut": "pending",
      "progression": 0,
      "created_at": "2026-07-09T17:21:00.000Z"
    }
  }
  ```

---

### GET `/api/jobs/:id`
Récupère le statut et l'état d'avancement d'une tâche.
- **Paramètre** : `id` (UUID du job).
- **Réponse (200)** :
  ```json
  {
    "success": true,
    "data": {
      "id_jobs": "uuid-du-job",
      "type_operation": "split",
      "statut": "done",
      "progression": 100,
      "resultat_url": "/api/files/download/uuid-du-fichier-resultat",
      "erreur_message": null,
      "created_at": "2026-07-09T17:21:00.000Z",
      "started_at": "2026-07-09T17:21:01.000Z",
      "completed_at": "2026-07-09T17:21:05.000Z"
    }
  }
  ```

---

### GET `/api/jobs`
Récupère l'historique des 50 derniers jobs soumis par l'utilisateur connecté.
- **Réponse (200)** :
  ```json
  {
    "success": true,
    "data": [
      {
        "id_jobs": "uuid-du-job-1",
        "type_operation": "compress",
        "statut": "done",
        "progression": 100,
        "resultat_url": "/api/files/download/uuid-du-resultat",
        "created_at": "2026-07-09T17:15:00.000Z",
        "completed_at": "2026-07-09T17:15:10.000Z"
      }
    ]
  }
  ```
