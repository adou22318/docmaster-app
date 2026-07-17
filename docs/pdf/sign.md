# Documentation — Signature (Incrustation Image avec Date) (`sign`)

**Semaine :** S4  
**Statut :** ✅ Validé Postman  
**Service :** [`sign.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/sign.js)

---

## Rôle

Incruste une signature (image PNG/JPG) à un emplacement précis sur une page d'un document PDF.  
Cette opération est une variante de l'opération `add_image` mais intègre des règles métiers spécifiques à la "signature" visuelle :
- Ajout automatique de la **date et heure locales** textuelles juste en dessous de l'image insérée.
- Renvoi d'un message légal de type _Disclaimer eIDAS_ stipulant qu'il s'agit d'une signature simple.

> ⚠️ **Attention légale :** Cette opération applique une "signature visuelle simple" (incrustation d'image). Elle **ne réalise pas** de signature cryptographique numérique (e-signature avec certificat PAdES). Le backend renvoie explicitement cette information dans sa réponse.

---

## Fichiers requis

Le tableau `fichiers` doit contenir **exactement 2 UUIDs** dans cet ordre :

```json
"fichiers": ["uuid-pdf-cible", "uuid-image-signature"]
```

---

## Options

| Paramètre | Type          | Défaut       | Description |
|-----------|---------------|--------------|-------------|
| `page`    | string/number | `"1"`        | La page **1-indexée** sur laquelle apposer la signature. (Une signature n'est apposée que sur une seule page). |
| `x`       | number        | `50`         | Coordonnée X en points PDF depuis le coin bas-gauche. |
| `y`       | number        | `50`         | Coordonnée Y en points PDF depuis le coin bas-gauche. |
| `largeur` | number        | `150`        | Largeur cible de la signature en points. La hauteur est calculée proportionnellement. |
| `hauteur` | number        | auto         | (Optionnel) Hauteur forcée de la signature. |

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
    "page": "1",
    "x": 400,
    "y": 100,
    "largeur": 200
  }
}
```

## Réponse de résultat (`GET /api/jobs/:id`)

Contrairement aux autres opérations, le statut `done` inclut un message d'avertissement légal.

```json
{
  "statut": "done",
  "resultat_url": "/api/files/download/uuid-du-resultat-signe",
  "disclaimer_eidas": "Avertissement eIDAS : Ceci est une signature visuelle simple sans valeur cryptographique."
}
```

---

## Codes d'erreur

| Code                   | Cause                                                               |
|------------------------|---------------------------------------------------------------------|
| `FICHIER_INTROUVABLE`  | L'un des deux UUIDs ne correspond à aucun fichier.                  |
| `FORMAT_IMAGE_INVALIDE`| L'image de signature n'est ni PNG ni JPG.                           |
| `PAGE_INVALIDE`        | La page demandée dépasse le nombre total de pages du document.      |
| `ECHEC_SIGNATURE`      | Erreur interne lors de l'incrustation.                              |

---

## Notes techniques

- Le service utilise **`pdf-lib`**.
- La date apposée est formatée selon le locale local du serveur (`Intl.DateTimeFormat` en `fr-FR`).
- Le texte de la date est apposé quelques pixels sous l'image de la signature. Une police standard (`Helvetica`) est embarquée.
- Le message `disclaimer_eidas` est transmis par le service de traitement jusqu'au contrôleur via la file `Bull Queue`.
