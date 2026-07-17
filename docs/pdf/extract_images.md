# Documentation — Extraction d'images embarquées (`extract_images`)

**Semaine :** S4  
**Statut :** ✅ Validé Postman  
**Service :** [`extractImages.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/extractImages.js)

---

## Rôle

Extrait les **images incrustées nativement** dans un fichier PDF (objets `XObject` de type `Image`).

> ⚠️ **Différence fondamentale avec `pdf_to_images` :**  
> `pdf_to_images` prend une **photo de la page entière** (texte + images + mise en page) via Ghostscript.  
> `extract_images` **pêche uniquement les fichiers images bruts** qui ont été incorporés dans le PDF — texte et structure sont ignorés.

**Cas d'usage :** Un PDF de rapport de 10 pages contient des photos à la page 5. `extract_images` retournera ces photos dans leur résolution d'origine, sans le texte ni le fond de page.

---

## Options

| Paramètre | Type   | Défaut      | Description                                        |
|-----------|--------|-------------|----------------------------------------------------|
| `pages`   | string | toutes      | Syntaxe de sélection : `"1-3, 5, 8"`. Si absent, analyse tout le document. |

---

## Comportement de sortie

| Nombre d'images trouvées | Fichier retourné             |
|--------------------------|------------------------------|
| 1 seule image            | Fichier `.png` ou `.jpg` directement |
| 2 images ou plus         | Archive `.zip` contenant toutes les images, nommées `page_N_img_M.png`. |
| 0 image                  | Erreur `AUCUNE_IMAGE_EMBARQUEE_TROUVEE` |

---

## Formats supportés

| Filtre interne (PDF) | Format de sortie |
|----------------------|------------------|
| `DCTDecode`          | `.jpg` (les octets bruts sont un fichier JPEG valide, sauvegarde directe) |
| `FlateDecode`        | `.png` (décompression zlib + encodage PNG via `sharp`) |
| `JPXDecode`          | `.jp2` (sauvegarde brute JPEG 2000) |
| Autres (JBIG2, CCITT) | Ignorés (avertissement console) |

> Les images de moins de 10×10 pixels (spacers, puces, masques de transparence) sont automatiquement ignorées.

---

## Exemple de requête

```json
{
  "type_operation": "extract_images",
  "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
  "options": {
    "pages": "5"
  }
}
```

## Réponse de résultat (`GET /api/jobs/:id`)

```json
{
  "statut": "done",
  "resultat_url": "/api/files/download/uuid-du-resultat",
  "imagesGenerees": 2
}
```

---

## Codes d'erreur

| Code                              | Cause                                                        |
|-----------------------------------|--------------------------------------------------------------|
| `FICHIER_INTROUVABLE`             | L'UUID fourni ne correspond à aucun fichier.                 |
| `AUCUNE_IMAGE_EMBARQUEE_TROUVEE`  | Aucune image XObject valide trouvée dans les pages sélectionnées. |
| `ECHEC_EXTRACTION_IMAGES`         | Erreur de parsing ou d'encodage (PDF corrompu, etc.).        |
| `PAGES_INVALIDES`                 | La syntaxe de sélection est incorrecte ou dépasse le nombre de pages. |

---

## Notes techniques

- L'extraction utilise **`pdf-lib`** pour parcourir l'arbre binaire du PDF et accéder directement aux flux des objets `XObject`. Ce choix garantit un accès synchrone et complet à toutes les ressources du document, contrairement à `pdfjs-dist` qui requiert un contexte de rendu.
- Le recodage des pixels bruts (`FlateDecode`) est effectué par la librairie native C++ **`sharp`**.
- Les dossiers temporaires sont nettoyés automatiquement, y compris en cas d'erreur.
