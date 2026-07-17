# Documentation — Rasterisation de pages PDF (`pdf_to_images`)

**Semaine :** S4  
**Statut :** ✅ Validé Postman  
**Service :** [`rasterize.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/rasterize.js)

---

## Rôle

Convertit une ou plusieurs pages d'un PDF en fichiers images (PNG ou JPG) en utilisant **Ghostscript** pour la rasterisation. Contrairement à l'extraction d'images embarquées, cette opération prend une **photo complète** de la page telle qu'elle s'afficherait à l'écran (texte + images + mise en page).

> **Prérequis :** Ghostscript doit être installé sur le serveur. Le chemin peut être configuré via la variable d'environnement `GS_COMMAND`.

---

## Options

| Paramètre | Type   | Défaut      | Description                                        |
|-----------|--------|-------------|----------------------------------------------------|
| `pages`   | string | toutes      | Syntaxe de sélection : `"1-3, 5, 8"`.             |
| `dpi`     | number | `150`       | Résolution de la rasterisation. Plus le DPI est élevé, plus l'image est nette mais lourde. `72` (web), `150` (standard), `300` (impression). |
| `format`  | string | `'png'`     | Format de sortie : `'png'` (sans perte) ou `'jpg'` (compression avec perte). |

---

## Comportement de sortie

| Nombre de pages résultantes | Fichier retourné        |
|-----------------------------|-------------------------|
| 1 seule page                | Fichier `.png` ou `.jpg` directement |
| 2 pages ou plus             | Archive `.zip` contenant toutes les images, nommées `page_1.png`, `page_2.png`, etc. |

---

## Exemple de requête

```json
{
  "type_operation": "pdf_to_images",
  "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
  "options": {
    "pages": "1-3",
    "dpi": 300,
    "format": "png"
  }
}
```

## Réponse de résultat (`GET /api/jobs/:id`)

```json
{
  "statut": "done",
  "resultat_url": "/api/files/download/uuid-du-resultat",
  "imagesGenerees": 3
}
```

---

## Codes d'erreur

| Code                         | Cause                                              |
|------------------------------|----------------------------------------------------|
| `FICHIER_INTROUVABLE`        | L'UUID fourni ne correspond à aucun fichier.       |
| `ECHEC_RASTERISATION`        | Ghostscript a retourné une erreur (fichier corrompu, PDF chiffré, etc.). |
| `AUCUNE_IMAGE_GENEREE`       | Ghostscript n'a produit aucun fichier (pages vides, erreur silencieuse). |
| `PAGES_INVALIDES`            | La syntaxe de sélection est incorrecte ou dépasse le nombre de pages du document. |

---

## Notes techniques

- Le binaire Ghostscript est résolu dans l'ordre : `GS_COMMAND` env → `gs` (Linux/Mac) → `gswin64c` / `gswin32c` (Windows).
- Les fichiers temporaires produits par Ghostscript sont supprimés automatiquement, y compris en cas d'erreur partielle.
- La numérotation dans les noms de fichiers du ZIP est **1-indexée** et correspond aux numéros de pages **tels que fournis par l'utilisateur** (pas la position dans le tableau).
