# Module de Division PDF (Split)

**Semaine :** S3
**Statut :** ✅ Fonctionnel et Intégré (Sélection avancée et exports conditionnels)
**Service :** [split.js](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/split.js)
**Parser :** [parsePages.js](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/parsePages.js)

## Vue d'ensemble

Le module de division permet d'extraire des pages spécifiques d'un PDF source. Contrairement aux versions basiques, il supporte une syntaxe de sélection de pages riche (pages individuelles, plages de pages, combinaisons) ainsi qu'un export dynamique (PDF unique ou archive ZIP).

## Syntaxe de sélection (Input utilisateur)

L'application accepte une chaîne flexible définissant les pages à extraire :
- **Pages individuelles** : Séparées par des virgules (ex: `2, 8, 14`).
- **Plages de pages** : Définies par un tiret (ex: `5-10`).
- **Sélection combinée / complexe** : Mélange des deux (ex: `1-3, 7, 12-15`).

## Gestion du format de sortie (Output)

Le comportement de division est dicté par l'option `mode` choisie par l'utilisateur :

### Cas A : Mode `single`
Toutes les pages de la sélection sont fusionnées dans un **unique fichier PDF** de sortie.
- **Exemple** : `selection: "1-3, 7"`, `mode: "single"` → Un seul fichier PDF contenant les pages 1, 2, 3 et 7.
- **Type MIME** : `application/pdf`.

### Cas B : Mode `separate`
Chaque groupe de sélection (chaque plage ou page isolée) produit un **fichier PDF distinct**.
- **Si 1 seul fichier est généré** : Téléchargement direct du fichier `.pdf` résultant.
- **Si plusieurs fichiers sont générés** : Compression automatique de tous les PDF générés dans une archive `.zip` unique pour le téléchargement. Les fichiers dans l'archive sont nommés de manière descriptive (ex: `pages_1-3.pdf`, `page_7.pdf`).
- **Type MIME** : `application/zip` (ou `application/pdf` si le découpage ne produit finalement qu'un seul fichier).

## Logique d'implémentation

1. **Analyse de la sélection** : 
   - `parsePageSelection` : Nettoie, déduplique et trie les pages sélectionnées sous forme d'indices triés pour le mode `single`.
   - `parsePageGroups` : Conserve les groupes individuels séparés par des virgules pour le mode `separate`.
2. **Extraction via `pdf-lib`** : Le service crée un document vierge, copie les pages sélectionnées avec `copyPages()` et les ajoute avec `addPage()`.
3. **Packaging ZIP via `archiver`** :
   - En mode `separate` avec plusieurs PDF, l'application utilise la classe `ZipArchive` du module `archiver` (version ESM 8.0.0+) pour générer le flux ZIP en mémoire et l'écrire directement sur le disque.

## Gestion des erreurs

- `FICHIER_INTROUVABLE` : Le fichier d'origine n'existe pas.
- `SELECTION_VIDE` : Aucun texte de sélection fourni.
- `SYNTAXE_INVALIDE:<segment>` : Erreur de format (ex: lettres, tirets multiples).
- `PLAGE_INVERSEE:<segment>` : Plage incohérente (ex: `10-5`).
- `PAGE_HORS_BORNES:<page>` : Numéro de page inférieur à 1 ou supérieur au nombre total de pages du document source.
