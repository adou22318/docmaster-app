# Documentation — Signature Électronique Simple (`sign`)

**Semaine :** S4 → Améliorations UI S5  
**Statut :** ✅ Validé  
**Service :** [`sign.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/sign.js)  
**Viewer frontend :** [`PdfSignatureViewer.jsx`](file:///c:/Users/USER/Desktop/docmaster-app/frontend/src/components/workspace/viewer/PdfSignatureViewer.jsx)

---

## Rôle

Incruste une signature visuelle sur une page d'un PDF, avec option d'ajout automatique de la date. Trois modes de création de signature sont disponibles.

> ⚠️ **Important légal :** Cette opération applique une **signature visuelle simple** (incrustation d'image). Elle **ne constitue pas** une signature électronique au sens du règlement eIDAS (pas de certificat numérique, pas d'horodatage certifié, pas de valeur juridique probante). Ce message est affiché dans l'UI et renvoyé dans la réponse backend.

---

## Modes de création de signature (S5)

### Mode 1 — Dessin manuscrit (canvas)
L'utilisateur dessine sa signature à la souris ou au doigt sur un canvas HTML. Le tracé est exporté en PNG et uploadé automatiquement.

### Mode 2 — Import d'image
L'utilisateur importe un fichier PNG ou JPG contenant sa signature (fond transparent recommandé pour PNG).

### Mode 3 — Texte calligraphique
L'utilisateur saisit son nom/prénom. Une fonte cursive (Pacifico, Dancing Script…) est appliquée et rendue en canvas avant upload.

---

## Positionnement (S5 — refonte)

Le positionnement est effectué par drag & drop sur la prévisualisation PDF dans `PdfSignatureViewer.jsx` :

1. La signature apparaît centrée au chargement
2. L'utilisateur la déplace librement, avec contraintes de bords
3. Un redimensionnement par poignée d'angle est disponible
4. Les coordonnées PDF (`x`, `y`, `largeur`, `hauteur`) sont calculées côté frontend et transmises au backend

**Disclaimer eIDAS :** La modale `SignatureDisclaimer.jsx` s'affiche à la première utilisation de l'outil par l'utilisateur (état persisté en `sessionStorage`). L'utilisateur doit explicitement accepter avant de pouvoir utiliser l'outil.

---

## Fichiers requis

```json
"fichiers": ["uuid-pdf-cible", "uuid-image-signature"]
```

---

## Options

| Paramètre  | Type    | Défaut | Description |
|------------|---------|--------|-------------|
| `page`     | number  | 1      | Numéro de la page où apposer la signature (1-indexé) |
| `x`        | number  | —      | Coordonnée X en points PDF (depuis coin bas-gauche) |
| `y`        | number  | —      | Coordonnée Y en points PDF |
| `largeur`  | number  | 200    | Largeur de la signature en points |
| `hauteur`  | number  | 100    | Hauteur de la signature en points |
| `addDate`  | boolean | false  | Si `true`, ajoute la date courante en texte juste sous la signature |

---

## Exemple de requête

```json
{
  "type_operation": "sign",
  "fichiers": [
    "8073ea45-56be-43ad-8d3f-42a1ab9430c2",
    "f7c2a11b-3d8e-4901-bb5f-89c123de4567"
  ],
  "options": {
    "page": 1,
    "x": 350,
    "y": 100,
    "largeur": 180,
    "hauteur": 90,
    "addDate": true
  }
}
```

## Réponse de résultat

```json
{
  "statut": "done",
  "resultat_url": "/api/files/download/uuid-du-resultat",
  "disclaimer": "Cette signature est une signature visuelle simple. Elle n'a pas de valeur juridique au sens du règlement eIDAS."
}
```

---

## Codes d'erreur

| Code | Cause |
|------|-------|
| `FICHIER_INTROUVABLE` | Un des deux UUIDs est inconnu |
| `FORMAT_IMAGE_INVALIDE` | L'image n'est ni PNG ni JPG |
| `PAGE_INVALIDE` | Numéro de page hors bornes |
| `ECHEC_SIGNATURE` | Erreur d'écriture dans le PDF |

---

## Notes techniques

- Implémenté avec **`pdf-lib`** (pas de dépendance binaire externe).
- La date est rendue en police Helvetica (incluse dans `pdf-lib`) avec une taille de 10 pts.
- Les coordonnées PDF ont leur **origine en bas-gauche** — la conversion est effectuée dans `PdfSignatureViewer.jsx` avant l'envoi.
