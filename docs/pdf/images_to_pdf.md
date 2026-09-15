# Documentation — Assemblage d'images en PDF (`convert_images_to_pdf`)

**Semaine :** S5 (nouveau)  
**Statut :** ✅ Validé  
**Service :** [`imagesToPdf.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/imagesToPdf.js)  
**Options frontend :** [`ImagesToPdfOptions.jsx`](file:///c:/Users/USER/Desktop/docmaster-app/frontend/src/components/workspace/options/ImagesToPdfOptions.jsx)

---

## Rôle

Assemble une liste d'images (JPEG, PNG, TIFF, BMP, GIF) en un seul document PDF, chaque image occupant une page. L'ordre, le format de page, l'orientation et les marges sont configurables.

---

## Fichiers requis

Le tableau `fichiers` doit contenir **entre 1 et 20 UUIDs** d'images, **dans l'ordre souhaité** (l'utilisateur peut les réordonner via drag & drop dans `MultiFileSelection.jsx`) :

```json
"fichiers": ["uuid-image-1", "uuid-image-2", "uuid-image-3"]
```

---

## Options

| Paramètre     | Type   | Valeurs                              | Défaut      | Description |
|---------------|--------|--------------------------------------|-------------|-------------|
| `format`      | string | `a4`, `letter`                       | `a4`        | Format de page : A4 (595×842 pts) ou US Letter (612×792 pts) |
| `orientation` | string | `auto`, `portrait`, `landscape`      | `auto`      | `auto` : chaque page adapte son orientation à l'image (image large → paysage, image haute → portrait). |
| `margin`      | string | `none`, `small`, `large`             | `none`      | Marge autour de l'image : aucune / ~6 mm / ~12 mm |

---

## Comportement de mise en page

- Chaque image est **redimensionnée proportionnellement** pour remplir au maximum la zone utile (page - marges), sans déformer.
- L'image est **centrée** dans la zone utile.
- En mode `orientation: "auto"` : si `largeur_image > hauteur_image` → page en paysage ; sinon → portrait.
- Les images TIFF, BMP, GIF sont traitées comme JPEG si `pdf-lib` peut les lire, sinon comme PNG.

---

## Exemple de requête

```json
{
  "type_operation": "convert_images_to_pdf",
  "fichiers": [
    "uuid-img-1",
    "uuid-img-2",
    "uuid-img-3"
  ],
  "options": {
    "format": "a4",
    "orientation": "auto",
    "margin": "small"
  }
}
```

## Réponse de résultat

```json
{
  "statut": "done",
  "resultat_url": "/api/files/download/uuid-du-resultat"
}
```

Le fichier de sortie est un `.pdf` contenant autant de pages que d'images.

---

## Codes d'erreur

| Code | Cause |
|------|-------|
| `FICHIER_INTROUVABLE` | Un UUID du tableau ne correspond à aucun fichier |
| `ECHEC_ASSEMBLAGE` | Erreur de lecture ou d'encodage de l'image (format non supporté) |

---

## Formats d'entrée acceptés

| Extension         | Support |
|-------------------|---------|
| `.jpg`, `.jpeg`   | ✅ JPEG natif `pdf-lib` |
| `.png`            | ✅ PNG natif `pdf-lib` |
| `.bmp`, `.gif`, `.tiff` | ⚠️ Tentative JPEG puis PNG — certains encodages peuvent échouer |

---

## Notes techniques

- Implémenté avec **`pdf-lib`** uniquement, sans dépendance binaire externe (Ghostscript non requis).
- L'ordre des pages dans le PDF correspond **exactement** à l'ordre du tableau `fichiers`.
- Côté frontend, `MultiFileSelection.jsx` gère l'upload parallèle (barre de progression par fichier) et le réordonnancement drag & drop via `@hello-pangea/dnd`.
