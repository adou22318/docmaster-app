# Module de Protection PDF (QPDF & Robustesse)

**Semaine :** S3
**Statut :** ✅ Fonctionnel et Intégré (Chiffrement robuste, pré-nettoyage et tolérance aux avertissements)
**Service :** [protect.js](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/pdf/protect.js)

## Vue d'ensemble

Le module de protection permet de chiffrer les documents PDF à l'aide d'un mot de passe utilisateur et propriétaire (AES-256). Pour faire face aux fichiers PDF corrompus ou volumineux, ce module intègre une logique robuste de nettoyage et de tolérance aux avertissements système.

## Fonctionnalités clés & Robustesse

### 1. Pré-nettoyage automatique (Sanitization Pipeline)
Avant d'appliquer le chiffrement, le fichier source passe par un processus de réparation/normalisation afin de corriger les éventuelles erreurs de structure internes (ex: clés dupliquées, tables xref décalées) :
1. **Passe de linéarisation QPDF** : L'outil exécute en premier lieu `qpdf --linearize`. Cette étape restructure le fichier de façon propre.
2. **Fallback Ghostscript (Reconstruction par ré-impression)** : Si la linéarisation échoue, le service bascule sur un fallback Ghostscript :
   ```bash
   gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER -dQUIET -sOutputFile=<chemin_temp> <chemin_source>
   ```
   Ghostscript va ré-interpréter l'ensemble du document et générer un PDF structurellement sain.
3. **Mode dégradé** : Si les deux tentatives de nettoyage échouent, le service tente d'appliquer la protection directement sur le fichier original.

Les fichiers temporaires créés lors de ce processus de nettoyage sont automatiquement supprimés à la fin du traitement.

### 2. Gestion tolérante des codes de sortie de QPDF
Par défaut, QPDF peut retourner le code de sortie `3` (désignant `EXIT_WARNING`) lorsqu'il rencontre des anomalies mineures non bloquantes dans le document (par exemple, des références d'objets inutilisées ou des erreurs de syntaxe légères) tout en créant correctement le fichier de sortie chiffré.

- **Ancien comportement** : Traitait tout code différent de `0` comme une exception fatale.
- **Nouveau comportement** : Le service intercepte le code de retour. Si le code est `0` ou `3`, l'opération est considérée comme réussie. L'avertissement retourné par le code `3` est enregistré dans la console (`console.warn`) pour des fins de diagnostic au lieu d'interrompre le job de traitement.

## Gestion des erreurs

- `FICHIER_INTROUVABLE` : Le fichier d'origine n'existe pas.
- `MOT_DE_PASSE_TROP_COURT` : Le mot de passe spécifié fait moins de 4 caractères.
- `PROTECTION_ECHOUEE` : Levée en cas d'erreur fatale durant l'exécution de la commande de chiffrement.
- `MOT_DE_PASSE_INCORRECT` : Levée dans `unprotectService` si le mot de passe fourni ne permet pas de déchiffrer le PDF.
- `FICHIER_RESULTAT_MANQUANT` : Levée si la commande réussit mais qu'aucun fichier n'est écrit sur le disque.
