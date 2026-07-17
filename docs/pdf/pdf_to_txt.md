# Documentation — Extraction de texte (`pdf_to_txt`)

**Semaine :** S4  
**Statut :** ✅ Validé Postman  
**Service :** [`pdfToTxt.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/pdfToTxt.js)

---

## Rôle

Extrait le contenu textuel d'un document PDF et le retourne sous forme d'un fichier `.txt`. Supporte la sélection de pages afin de n'extraire le texte que d'une portion du document.

> ⚠️ **Limitation :** Cette opération ne peut extraire que le texte **sélectionnable** d'un PDF (texte encodé dans le flux du document). Elle ne fait **pas** d'OCR (reconnaissance optique de caractères). Un PDF constitué de pages scannées (images) retournera une erreur `AUCUN_TEXTE_EXTRAIT`.

---

## Options

| Paramètre | Type   | Défaut  | Description                                          |
|-----------|--------|---------|------------------------------------------------------|
| `pages`   | string | toutes  | Syntaxe de sélection : `"1-3, 5, 8"`. Si absent, tout le document est extrait. |

---

## Exemple de requête

```json
{
  "type_operation": "pdf_to_txt",
  "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"],
  "options": {
    "pages": "1-5"
  }
}
```

## Réponse de résultat (`GET /api/jobs/:id`)

```json
{
  "statut": "done",
  "resultat_url": "/api/files/download/uuid-du-fichier-txt",
  "pagesSource": 5
}
```

`pagesSource` indique le nombre de pages effectivement parsées.

---

## Codes d'erreur

| Code                   | Cause                                                               |
|------------------------|---------------------------------------------------------------------|
| `FICHIER_INTROUVABLE`  | L'UUID fourni ne correspond à aucun fichier.                        |
| `AUCUN_TEXTE_EXTRAIT`  | Le document ne contient pas de texte sélectionnable (PDF scanné, PDF d'images pures). |
| `PAGES_INVALIDES`      | La syntaxe de sélection est incorrecte ou dépasse le nombre de pages. |
| `ECHEC_EXTRACTION_TEXTE` | Erreur interne du parser (PDF chiffré, corrompu, etc.).           |

---

## Notes techniques

- La librairie utilisée est **`pdf-parse` v2** (moteur basé sur `pdfjs-dist`). Son API v2 utilise une classe `PDFParse` instanciée avec `{ data: Uint8Array }`, différente de la v1 (`pdfParse(buffer)`).
- Le filtrage de pages utilise les **options natives** de `pdf-parse v2` :
  - `{ first: N }` → N premières pages
  - `{ first: A, last: B }` → plage de A à B
  - `{ partial: [1, 3, 7] }` → pages non contiguës
- Le nombre total de pages est obtenu via **`pdf-lib`** avant l'extraction, pour valider la sélection.
- Le texte extrait est nettoyé (sauts de ligne excessifs supprimés) avant sauvegarde.
