# Gestion des fichiers — DocMaster

**Date :** [date du jour]
**Semaine :** S2
**Statut :** ✅ Complet

## Vue d'ensemble
Système d'upload, stockage et téléchargement de fichiers PDF/Office/Images.
Connexion obligatoire pour toutes les opérations.

## Endpoints

### POST /api/files/upload
**Header :** Authorization: Bearer <access_token>
**Body :** form-data, clé `file`
**Succès (201) :** { id_files, nom_original, taille_octets, type_mime, created_at }
**Erreurs :**
- 400 (aucun fichier reçu)
- 400 (fichier > 50 Mo)
- 400 (format non supporté)
- 400 (quota de stockage dépassé)
- 401 (non authentifié)

### GET /api/files/:id
**Header :** Authorization: Bearer <access_token>
**Succès (200) :** détails du fichier
**Erreurs :** 404 (fichier introuvable ou n'appartient pas à l'utilisateur)

### GET /api/files/download/:id
**Header :** Authorization: Bearer <access_token>
**Succès (200) :** fichier binaire téléchargeable
**Erreurs :** 403 (accès refusé), 404 (fichier expiré/supprimé)

## Choix techniques

**Connexion obligatoire pour upload :** simplification volontaire par
rapport à Smallpdf qui autorise l'usage anonyme. Décision prise pour
réduire la complexité d'un projet solo — documenté comme perspective V2.

**Nom de stockage UUID :** le nom original n'est jamais utilisé sur le
disque pour éviter les collisions et les attaques par chemin (path
traversal). Le nom original est conservé en BDD pour l'affichage.

**Détection MIME par extension :** Multer/Postman peuvent envoyer
`application/octet-stream` au lieu du vrai type. La bibliothèque
mime-types détecte le type réel depuis l'extension du fichier,
plus fiable que le Content-Type fourni par le client.

**Validation à deux niveaux :** taille et type vérifiés côté client
(UX) ET côté serveur (sécurité réelle) — ne jamais faire confiance
au client seul.

**Suppression du fichier orphelin en cas d'erreur :** si l'insertion
en BDD échoue après l'upload physique, le fichier est supprimé du
disque pour éviter d'accumuler des fichiers non référencés.

## Variables d'environnement requises
- UPLOAD_DIR

## Limitations connues (V1)
- Pas de mode visiteur (connexion obligatoire)
- Pas de drag-and-drop multi-fichiers (un seul fichier par requête)