# Documentation — Extraction d'images embarquées (`extract_images`)

**Semaine :** S4 → Améliorations S5  
**Statut :** ✅ Validé  
**Accès :** 🔒 Abonnés Pro uniquement (`checkSubscription.js`)  
**Service :** [`extractImages.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/extractImages.js)

---

## Rôle

Extrait les **images incrustées nativement** dans un fichier PDF (objets `XObject` de type `Image`), avec contrôle avancé de la taille de sortie et du format.

> ⚠️ **Différence avec `pdf_to_images` :**  
> `pdf_to_images` rasterise la page entière (texte + images + mise en page) via Ghostscript.  
> `extract_images` extrait uniquement les images brutes embarquées — texte et structure ignorés.

---

## Options complètes (S5)

### Périmètre

| Paramètre | Type   | Défaut  | Description |
|-----------|--------|---------|-------------|
| `pages`   | string | toutes  | Syntaxe : `"1-3, 5, 8"`. Si absent, toutes les pages. |

### Redimensionnement — 3 modes exclusifs

**Mode 1 — Taille originale** (défaut)
```json
{ "mode_taille": "original" }
```

**Mode 2 — Dimensions personnalisées**
```json
{
  "mode_taille": "custom",
  "largeur": 1920,
  "hauteur": 1080,
  "garder_ratio": true
}
```
Si `garder_ratio: true` → ratio conservé, letterboxing si nécessaire.  
Si une seule dimension → l'autre calculée proportionnellement.

**Mode 3 — Raccourcis HD prédéfinis**
```json
{ "mode_taille": "preset", "preset": "4k" }
```

| `preset`    | Résolution     | Usage         |
|-------------|----------------|---------------|
| `hd`        | 1280 × 720 px  | HD standard   |
| `full_hd`   | 1920 × 1080 px | Full HD       |
| `4k`        | 3840 × 2160 px | Ultra HD      |
| `a4_300dpi` | 2480 × 3508 px | Impression A4 |

### Format de sortie

| Paramètre       | Valeurs                  | Défaut     | Description |
|-----------------|--------------------------|------------|-------------|
| `format_sortie` | `original`, `png`, `jpg` | `original` | `original` conserve le format natif. `png` force sans perte. `jpg` force JPEG qualité 92%. |

---

## Comportement de sortie

| Images trouvées | Résultat |
|-----------------|----------|
| 1 seule         | Fichier `.png` ou `.jpg` direct |
| 2 ou plus       | Archive `.zip` (`page_N_img_M.ext`) |
| 0               | Erreur `AUCUNE_IMAGE_EMBARQUEE_TROUVEE` |

---

## Formats internes supportés

| Filtre PDF    | Sortie par défaut |
|---------------|-------------------|
| `DCTDecode`   | `.jpg` (octets bruts JPEG, sauvegarde directe) |
| `FlateDecode` | `.png` (décompression zlib + encodage via `sharp`) |
| `JPXDecode`   | `.jp2` (brut JPEG 2000) |
| Autres        | Ignorés (JBIG2, CCITT…) |

> Images < 10×10 px (spacers, puces, masques) automatiquement ignorées.

---

## Exemples

**Extraction simple :**
```json
{
  "type_operation": "extract_images",
  "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
  "options": { "pages": "5" }
}
```

**Full HD, forcé PNG :**
```json
{
  "type_operation": "extract_images",
  "fichiers": ["uuid"],
  "options": { "mode_taille": "preset", "preset": "full_hd", "format_sortie": "png" }
}
```

**Largeur 800 px, ratio conservé, JPG :**
```json
{
  "type_operation": "extract_images",
  "fichiers": ["uuid"],
  "options": { "mode_taille": "custom", "largeur": 800, "garder_ratio": true, "format_sortie": "jpg" }
}
```

---

## Codes d'erreur

| Code | Cause |
|------|-------|
| `FICHIER_INTROUVABLE` | UUID inconnu |
| `AUCUNE_IMAGE_EMBARQUEE_TROUVEE` | Aucun XObject valide dans la sélection |
| `ECHEC_EXTRACTION_IMAGES` | PDF corrompu ou erreur d'encodage |
| `PAGES_INVALIDES` | Syntaxe incorrecte ou hors bornes |
| `ABONNEMENT_REQUIS` | Utilisateur sans plan Pro actif |

---

## Restriction d'accès Pro (S5)

Protégé par `checkSubscription.js`. Seuls les utilisateurs `statut = 'actif'` et `plan = 'pro'` peuvent accéder à cet outil. Les autres reçoivent `403 ABONNEMENT_REQUIS`.

Côté frontend, `OUTILS_PRO` dans `ToolPage.jsx` affiche une `ProGateModal` avant même l'upload.

---

## Notes techniques

- Extraction via **`pdf-lib`** (parcours direct de l'arbre XObject binaire).
- Redimensionnement via **`sharp`** (natif C++).
- Nettoyage automatique des fichiers temporaires, même en cas d'erreur.
