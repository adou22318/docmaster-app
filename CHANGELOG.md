# Changelog

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

## [Non Publié] - Mise à jour de la semaine (Sécurité PDF & Compression)

### Ajouté
- **Déchiffrement AES-256 avec QPDF** : Intégration de `qpdf` via un nouveau service `dechiffrer.js` pour contourner les limites de `pdf-lib` avec le chiffrement AES.
- **Workflow centralisé dans le Worker** : Le script `pdfWorker.js` intercepte automatiquement la présence d'un mot de passe et déchiffre le PDF via `qpdf` avant de l'envoyer à n'importe quel service.
- **Nettoyage Automatique** : Ajout d'un système robuste (bloc `finally`) dans le worker pour s'assurer que les fichiers temporaires déchiffrés sont toujours supprimés du disque.

### Corrigé
- **Erreur "PDF_CHIFFRE" sur `pdf_to_images`** : Le service de rasterisation reçoit désormais un fichier déchiffré, évitant ainsi le crash de `pdf-lib` lors du calcul du nombre de pages.
- **Augmentation de taille lors de la compression** : Ajout d'une vérification dans `compress.js`. Si la compression Ghostscript produit un fichier plus lourd que l'original (souvent le cas pour les PDF déjà très optimisés), l'application annule l'opération et retourne le fichier source sans altération, garantissant ainsi qu'un fichier compressé ne pèsera jamais plus lourd.
- **Nettoyage des paramètres obsolètes** : Suppression de l'argument `motDePasse` dans l'ensemble des appels à `loadPdf` puisque les fichiers sont maintenant gérés en amont.
