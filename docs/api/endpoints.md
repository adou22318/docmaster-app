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

#### D. Filigrane (watermark)
- **Fichiers** : Tableau contenant 1 seul UUID.
- **Options** :
  - `texte` (string) : Le texte du filigrane (défaut: `"CONFIDENTIEL"`).
  - `opacite` (number) : Opacité de 0 à 1 (défaut: `0.3`).
  - `rotation` (number) : Angle en degrés (défaut: `45`).
  - `taillePolice` (number) : Taille du texte (défaut: `50`).
  - `couleur` (string/object) : Code hexadécimal (ex: `"#FF0000"`) ou objet `{r, g, b}` (défaut: gris).
  - `position` (string) : `'centre'`, `'haut-gauche'`, `'haut-droite'`, `'bas-gauche'`, `'bas-droite'`, `'haut-centre'`, `'bas-centre'` (défaut: `'centre'`).
  - `pages` (string) : Syntaxe de sélection (ex: `"1-3, 5"`). Si absent, s'applique à toutes les pages.
- **Exemple** :
  ```json
  {
    "type_operation": "watermark",
    "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
    "options": {
      "texte": "BROUILLON",
      "couleur": "#FF0000",
      "position": "centre",
      "pages": "1, 3"
    }
  }
  ```

#### E. Suppression de pages (remove_pages)
- **Fichiers** : Tableau contenant 1 seul UUID.
- **Options** :
  - `selection` (string, requis) : Syntaxe de sélection des pages à supprimer (ex: `"2, 5-8"`).
- **Exemple** :
  ```json
  {
    "type_operation": "remove_pages",
    "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
    "options": {
      "selection": "2, 5-8"
    }
  }
  ```

#### F. Ajout de pages vierges (add_blank_pages)
- **Fichiers** : Tableau contenant 1 seul UUID.
- **Options** :
  - `nombre` (number) : Nombre de pages à ajouter (défaut: `1`).
  - `position` (string/number) : `'debut'`, `'fin'` (défaut), ou le numéro d'une page (ex: `"3"`) après laquelle insérer.
  - `format` (string) : `'a4'`, `'a3'`, `'a5'`, `'letter'`, `'legal'` (défaut: `'a4'`).
- **Exemple** :
  ```json
  {
    "type_operation": "add_blank_pages",
    "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
    "options": {
      "nombre": 2,
      "position": "fin",
      "format": "a4"
    }
  }
  ```

#### G. Rasterisation de pages (pdf_to_images)
- **Fichiers** : Tableau contenant 1 seul UUID.
- **Options** :
  - `dpi` (number) : Résolution en DPI (défaut: `150`).
  - `format` (string) : Format de sortie, `'png'` ou `'jpg'` (défaut: `'png'`).
  - `pages` (string) : Syntaxe de sélection (ex: `"1-3, 5"`). Défaut: toutes les pages.
- **Exemple** :
  ```json
  {
    "type_operation": "pdf_to_images",
    "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
    "options": {
      "dpi": 300,
      "format": "png",
      "pages": "1, 3"
    }
  }
  ```

#### G2. Extraction d'images embarquées (extract_images)
- **Fichiers** : Tableau contenant 1 seul UUID.
- **Options** :
  - `pages` (string) : Syntaxe de sélection (ex: `"1-3, 5"`). Défaut: toutes les pages.
- **Exemple** :
  ```json
  {
    "type_operation": "extract_images",
    "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
    "options": {
      "pages": "1-5"
    }
  }
  ```

#### H. Ajout d'image (add_image)
- **Fichiers** : Tableau contenant 2 UUIDs : `[ "uuid-pdf-cible", "uuid-image" ]`.
- **Options** :
  - `pages` (string) : Syntaxe de sélection (ex: `"1-3, 5"`). Défaut: toutes les pages.
  - `position` (string) : `'centre'`, `'haut-gauche'`, `'haut-droite'`, `'bas-gauche'`, `'bas-droite'`, `'haut-centre'`, `'bas-centre'` (défaut: `'centre'`).
  - `x`, `y` (number) : Coordonnées libres (écrasent la position prédéfinie).
  - `largeur`, `hauteur` (number) : Dimensions finales en points PDF.
- **Exemple** :
  ```json
  {
    "type_operation": "add_image",
    "fichiers": ["uuid-pdf-cible", "uuid-image-png-ou-jpg"],
    "options": {
      "position": "bas-droite",
      "largeur": 100
    }
  }
  ```

#### I. Conversion Office vers PDF (convert_to_pdf)
- **Fichiers** : Tableau contenant 1 seul UUID d'un fichier Office (DOCX, XLSX, PPTX).
- **Options** : Aucune.
- **Exemple** :
  ```json
  {
    "type_operation": "convert_to_pdf",
    "fichiers": ["uuid-fichier-docx"]
  }
  ```

#### J. Extraction de texte (pdf_to_txt)
- **Fichiers** : Tableau contenant 1 seul UUID.
- **Options** :
  - `pages` (string) : Syntaxe de sélection (ex: `"1-3, 5"`). Défaut: toutes les pages.
- **Exemple** :
  ```json
  {
    "type_operation": "pdf_to_txt",
    "fichiers": ["uuid-pdf-cible"],
    "options": {
      "pages": "1-5"
    }
  }
  ```

#### K. Signature (sign)
- **Fichiers** : Tableau contenant 2 UUIDs : `[ "uuid-pdf-cible", "uuid-image-signature" ]`.
- **Options** :
  - `page` (string/number) : Page cible 1-indexed (défaut: `1`).
  - `x`, `y` (number) : Coordonnées (défaut: `50, 50`).
  - `largeur` (number) : Largeur de l'image (défaut: `150`).
  - `hauteur` (number) : Hauteur de l'image.
- **Exemple** :
  ```json
  {
    "type_operation": "sign",
    "fichiers": ["uuid-pdf-cible", "uuid-signature-image"],
    "options": {
      "page": "1",
      "x": 400,
      "y": 100,
      "largeur": 200
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
