# Documentation — Ajout d'image dans un PDF (`add_image`)

**Semaine :** S4  
**Statut :** ✅ Validé Postman  
**Service :** [`addImage.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/addImage.js)

---

## Rôle

Incruste un fichier image (PNG ou JPG) sur une ou plusieurs pages d'un document PDF existant. L'image est positionnée via l'un des 7 raccourcis de position prédéfinis ou via des coordonnées libres.

---

## Fichiers requis

Le tableau `fichiers` doit contenir **exactement 2 UUIDs** dans cet ordre :

```json
"fichiers": ["uuid-pdf-cible", "uuid-image-png-ou-jpg"]
```

---

## Options

| Paramètre | Type          | Défaut       | Description |
|-----------|---------------|--------------|-------------|
| `pages`   | string        | toutes       | Syntaxe de sélection : `"1-3, 5"`. Si absent, l'image est ajoutée sur toutes les pages. |
| `position`| string        | `'centre'`   | Position prédéfinie (voir tableau ci-dessous). |
| `x`       | number        | —            | Coordonnée X en points PDF depuis le coin bas-gauche. Écrase `position`. |
| `y`       | number        | —            | Coordonnée Y en points PDF depuis le coin bas-gauche. Écrase `position`. |
| `largeur` | number        | auto         | Largeur cible en points PDF. Si seule `largeur` est fournie, la hauteur est calculée proportionnellement. |
| `hauteur` | number        | auto         | Hauteur cible en points PDF. Si seule `hauteur` est fournie, la largeur est calculée proportionnellement. |

### Positions prédéfinies

| Valeur          | Emplacement                   |
|-----------------|-------------------------------|
| `centre`        | Centre de la page             |
| `haut-gauche`   | Coin supérieur gauche + marge |
| `haut-droite`   | Coin supérieur droit + marge  |
| `bas-gauche`    | Coin inférieur gauche + marge |
| `bas-droite`    | Coin inférieur droit + marge  |
| `haut-centre`   | Milieu du bord supérieur      |
| `bas-centre`    | Milieu du bord inférieur      |

---

## Exemple de requête

```json
{
  "type_operation": "add_image",
  "fichiers": [
    "8073ea45-56be-43ad-8d3f-42a1ab9430c2",
    "f7c2a11b-3d8e-4901-bb5f-89c123de4567"
  ],
  "options": {
    "position": "bas-droite",
    "largeur": 100,
    "pages": "1"
  }
}
```

## Réponse de résultat (`GET /api/jobs/:id`)

```json
{
  "statut": "done",
  "resultat_url": "/api/files/download/uuid-du-resultat"
}
```

---

## Codes d'erreur

| Code                   | Cause                                                               |
|------------------------|---------------------------------------------------------------------|
| `FICHIER_INTROUVABLE`  | L'un des deux UUIDs ne correspond à aucun fichier.                  |
| `FORMAT_IMAGE_INVALIDE`| L'image n'est ni PNG ni JPG.                                        |
| `PAGES_INVALIDES`      | La syntaxe de sélection est incorrecte.                             |
| `ECHEC_AJOUT_IMAGE`    | Erreur lors de l'écriture dans le PDF (fichier corrompu, etc.).     |

---

## Notes techniques

- La librairie utilisée est **`pdf-lib`** (déjà présente pour les autres opérations), ce qui garantit une intégration sans dépendance externe.
- Les images sont redimensionnées **proportionnellement** si une seule dimension est fournie, préservant ainsi le ratio original.
- Les coordonnées dans `pdf-lib` ont leur **origine en bas-gauche** de la page (système de coordonnées PDF standard).
