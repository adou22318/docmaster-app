# Documentation — Ajout d'image dans un PDF (`add_image`)

**Semaine :** S4 → Refonte positionnement S5  
**Statut :** ✅ Validé  
**Service :** [`addImage.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/addImage.js)  
**Viewer frontend :** [`PdfImageViewer.jsx`](file:///c:/Users/USER/Desktop/docmaster-app/frontend/src/components/workspace/viewer/PdfImageViewer.jsx)

---

## Rôle

Incruste un fichier image (PNG ou JPG, max 5 Mo) sur une ou plusieurs pages d'un document PDF, avec positionnement libre défini par l'utilisateur via drag & drop dans l'interface.

---

## Fichiers requis

Le tableau `fichiers` doit contenir **exactement 2 UUIDs** dans cet ordre :

```json
"fichiers": ["uuid-pdf-cible", "uuid-image-png-ou-jpg"]
```

---

## Options

| Paramètre    | Type    | Défaut  | Description |
|--------------|---------|---------|-------------|
| `placements` | array   | —       | Tableau de placements par page (voir ci-dessous). Si absent, centrage automatique sur toutes les pages. |
| `pages`      | string  | toutes  | Sélection de pages (syntaxe `"1-3, 5"`). Utilisé uniquement si `placements` est absent. |
| `largeur`    | number  | auto    | Largeur en points PDF. |
| `hauteur`    | number  | auto    | Hauteur en points PDF. |

### Structure d'un placement (S5)

```json
{
  "placements": [
    { "page": 1, "x": 142.5, "y": 600.0, "largeur": 200, "hauteur": 100 },
    { "page": 3, "x": 50.0,  "y": 400.0, "largeur": 150, "hauteur": 75  }
  ]
}
```

- `x`, `y` : coordonnées en **points PDF** depuis le coin bas-gauche de la page
- `largeur`, `hauteur` : dimensions en points PDF
- Pages non présentes dans `placements` → image centrée automatiquement

---

## Comportement de positionnement (S5 — refonte complète)

### Ancienne approche (S4 — abandonnée)
7 positions prédéfinies (`centre`, `haut-gauche`, `bas-droite`…) + boutons de déplacement par pas de 0,5 cm.

### Nouvelle approche (S5)
1. **Centrage automatique à l'import** : `x = (largeur_page - largeur_image) / 2`
2. **Drag & Drop libre** sur la prévisualisation PDF (`PdfImageViewer.jsx`) avec contraintes de bords
3. **Coordonnées affichées en centimètres** dans le panneau latéral (conversion : `pts × 2.54 / 72`)
4. **Validation par page** : `Map<pageNumber, placement>` — chaque page peut avoir son propre emplacement validé indépendamment
5. **Mode hybride** : pages sans validation → centrage auto au backend
6. **Redimensionnement** via poignée d'angle avec conservation du ratio
7. **Support tactile** (mobile/tablette)

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
    "placements": [
      { "page": 1, "x": 200, "y": 650, "largeur": 150, "hauteur": 75 }
    ]
  }
}
```

---

## Codes d'erreur

| Code | Cause |
|------|-------|
| `FICHIER_INTROUVABLE` | L'un des deux UUIDs est inconnu |
| `FORMAT_IMAGE_INVALIDE` | L'image n'est ni PNG ni JPG |
| `PAGES_INVALIDES` | Syntaxe de sélection incorrecte |
| `ECHEC_AJOUT_IMAGE` | PDF corrompu ou erreur d'écriture |

---

## Notes techniques

- Implémenté avec **`pdf-lib`** (aucune dépendance binaire externe).
- Le système de coordonnées PDF a son **origine en bas-gauche** — la conversion cm↔pts est effectuée côté frontend avant envoi.
- Les images sont intégrées telles quelles si les dimensions correspondent, sinon redimensionnées proportionnellement.
