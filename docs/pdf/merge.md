# Module de Fusion PDF (Merge)

**Semaine :** S3
**Statut :** ✅ Fonctionnel et Intégré
**Service :** [merge.js](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/merge.js)

## Vue d'ensemble

Le service de fusion permet d'assembler plusieurs fichiers PDF en un seul document final de manière séquentielle. L'ordre des pages dans le document résultant correspond exactement à l'ordre des fichiers passés en entrée.

## Logique d'implémentation

1. **Création du document récepteur** : Un document PDF vierge est instancié à l'aide de la bibliothèque `pdf-lib` :
   ```javascript
   const pdfFusionne = await PDFDocument.create();
   ```
2. **Chargement et extraction séquentielle** :
   - Pour chaque fichier source, le service vérifie son existence sur le disque.
   - Le fichier est lu en mémoire puis chargé avec `PDFDocument.load(pdfBytes)`.
   - Toutes les pages sont copiées vers le document de destination grâce à `copyPages` :
     ```javascript
     const pages = await pdfFusionne.copyPages(pdfSource, pdfSource.getPageIndices());
     ```
3. **Insertion** : Chaque page copiée est ensuite ajoutée à la fin du document final avec `pdfFusionne.addPage(page)`.
4. **Validation** : Une vérification de sécurité est effectuée pour s'assurer qu'au moins une page a été fusionnée.
5. **Sauvegarde** : Le PDF final est enregistré sous un nom UUID dans le répertoire de stockage temporaire (défini par `UPLOAD_DIR` ou `./tmp/uploads`).

## Choix techniques & Bibliothèques

- **`pdf-lib`** : Utilisée pour la manipulation bas niveau des documents PDF en JavaScript sans dépendances binaires externes. Elle est particulièrement performante pour la fusion car elle évite d'interpréter visuellement le contenu (elle copie les structures d'objets PDF sous-jacentes).

## Gestion des erreurs

- `FICHIER_INTROUVABLE:<chemin>` : Levée si l'un des fichiers de la liste n'existe pas physiquement sur le disque.
- `AUCUNE_PAGE_FUSIONNEE` : Levée si le nombre de pages final est égal à 0.
