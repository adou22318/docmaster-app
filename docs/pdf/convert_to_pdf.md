# Documentation — Conversion Office vers PDF (`convert_to_pdf`)

**Semaine :** S4  
**Statut :** ✅ Validé Postman  
**Service :** [`convertToPdf.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/convertToPdf.js)

---

## Rôle

Convertit un fichier bureautique (Word, Excel ou PowerPoint) en document PDF en utilisant **LibreOffice** en mode "sans interface graphique" (headless).

> **Prérequis :** LibreOffice doit être installé sur le serveur. Le service détecte automatiquement l'exécutable dans les chemins Windows par défaut (`C:\Program Files\LibreOffice\program\soffice.exe`).

---

## Formats acceptés

| Extension | Type MIME                                                       |
|-----------|-----------------------------------------------------------------|
| `.docx`   | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.xlsx`   | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `.pptx`   | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |

---

## Options

Aucune option disponible. La conversion est entièrement automatique.

---

## Exemple de requête

```json
{
  "type_operation": "convert_to_pdf",
  "fichiers": ["8073ea45-56be-43ad-8d3f-42a1ab9430c2"]
}
```

## Réponse de résultat (`GET /api/jobs/:id`)

```json
{
  "statut": "done",
  "resultat_url": "/api/files/download/uuid-du-resultat-pdf"
}
```

---

## Codes d'erreur

| Code                        | Cause                                                         |
|-----------------------------|---------------------------------------------------------------|
| `FICHIER_INTROUVABLE`       | L'UUID fourni ne correspond à aucun fichier.                  |
| `TIMEOUT_CONVERSION_OFFICE` | La conversion a dépassé 120 secondes (fichier très volumineux ou LibreOffice bloqué). |
| `ECHEC_GENERATION_FICHIER`  | LibreOffice a terminé sans erreur mais n'a produit aucun fichier PDF. |
| `ECHEC_CONVERSION`          | Erreur interne de LibreOffice (fichier corrompu, format non supporté). |

---

## Notes techniques

- Un **timeout strict de 120 secondes** est appliqué. Si LibreOffice prend plus de 2 minutes, le processus est tué, les fichiers temporaires sont supprimés et le job passe en statut `failed`.
- Chaque conversion utilise un **dossier temporaire unique** (UUID) pour éviter tout conflit entre les jobs parallèles.
- La détection automatique de l'exécutable suit cet ordre : chemin `C:\Program Files\LibreOffice`, puis `C:\Program Files (x86)\LibreOffice`, puis fallback sur `soffice` dans le `PATH` système.
