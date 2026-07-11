# Module de Compression PDF (Ghostscript)

**Semaine :** S3
**Statut :** ✅ Fonctionnel et Intégré
**Service :** [compress.js](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/compress.js)

## Vue d'ensemble

Le service de compression permet de réduire le poids des fichiers PDF pour faciliter leur stockage et leur partage en ligne. Il repose sur l'utilitaire système **Ghostscript** invoqué en ligne de commande.

## Paramètres de compression (Niveaux & Compromis)

Nous proposons 3 profils de compression adaptés à différents cas d'usage :

| Profil (API) | Paramètre Ghostscript | Résolution des Images | Compromis | Cas d'usage type |
|--------------|-----------------------|-----------------------|-----------|------------------|
| `haute`      | `/screen`             | 72 DPI                | Qualité d'image fortement réduite, compression maximale. | Lecture rapide sur mobile, envoi par email restrictif. |
| `moyenne`    | `/ebook`              | 150 DPI               | Très bon compromis poids/qualité. Texte net, images acceptables. | Documents administratifs, factures, rapports. |
| `basse`      | `/printer`            | 300 DPI               | Qualité d'impression préservée, compression légère. | Documents à imprimer, plaquettes commerciales. |

## Logique d'implémentation

1. **Détection de l'exécutable Ghostscript** :
   Le service détecte dynamiquement le système d'exploitation.
   - Sur **Linux/macOS** : utilise la commande standard `gs`.
   - Sur **Windows** : cherche automatiquement le binaire `gswin64c.exe` dans le dossier standard `C:\Program Files\gs\<version>\bin\`. En cas d'absence, il tente d'appeler `gswin64c` globalement s'il est dans le PATH.
2. **Exécution CLI** :
   Le fichier source est traité à l'aide de la commande suivante :
   ```bash
   gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=<profil> -dNOPAUSE -dBATCH -dQUIET -sOutputFile=<chemin_sortie> <chemin_source>
   ```
3. **Calcul des gains** :
   Le service calcule la taille avant/après compression et retourne le pourcentage de réduction appliqué.

## Choix techniques & Prérequis système

- **Ghostscript** : Préféré aux solutions purement JS car il offre un moteur de rendu vectoriel et de traitement d'images mature, capable de réduire drastiquement le poids des fichiers (notamment via le sous-échantillonnage et la compression des images JPG/PNG imbriquées) sans altérer la structure de texte sous-jacente.
- **Prérequis** : L'exécutable Ghostscript doit être installé sur le système hôte ou inclus dans le conteneur Docker de production.
