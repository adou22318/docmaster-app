# Système de jobs (Bull Queue) — DocMaster

**Date :** [date du jour]
**Semaine :** S2
**Statut :** ✅ Complet (traitement simulé — vrais services en S3)

## Vue d'ensemble
File d'attente asynchrone pour le traitement PDF. Permet de répondre
immédiatement à l'utilisateur sans bloquer le serveur pendant les
opérations lourdes.

## Architecture

POST /api/jobs crée une entrée en BDD (statut=pending) et ajoute
le job dans Bull Queue (Redis). Le Worker (processus séparé) consomme
les jobs, met à jour la progression en temps réel, et termine avec
statut=done ou statut=error.

## Endpoints

### POST /api/jobs
**Header :** Authorization: Bearer <access_token>
**Body :** { type_operation, fichiers: [file_id, ...] }
**Succès (201) :** { id_jobs, statut: 'pending', ... }
**Erreurs :**
- 400 (opération invalide ou fichiers manquants)
- 403 (fichier n'appartenant pas à l'utilisateur)
- 404 (fichier introuvable)

### GET /api/jobs/:id
**Header :** Authorization: Bearer <access_token>
**Succès (200) :** statut actuel + progression
**Erreurs :** 404 (job introuvable ou n'appartenant pas à l'utilisateur)

### GET /api/jobs
**Header :** Authorization: Bearer <access_token>
**Succès (200) :** liste des 50 derniers jobs de l'utilisateur

## Choix techniques

**Bull + Redis :** sans file d'attente, un traitement de 8 secondes
bloquerait le serveur pour tous les autres utilisateurs. Bull permet
de répondre immédiatement avec un job_id et de traiter en arrière-plan.

**Worker séparé du serveur Express :** lancé via `npm run worker`
dans un processus distinct. Permet de scaler le traitement
indépendamment du serveur API si nécessaire.

**Polling plutôt que WebSocket :** le frontend interroge GET /jobs/:id
toutes les 2 secondes. Plus simple à implémenter qu'une connexion
WebSocket permanente, suffisant pour le volume attendu du projet.

**Vérification de propriété sur jobs_files :** avant de créer un job,
on vérifie que chaque fichier appartient bien à l'utilisateur qui fait
la demande — empêche qu'un utilisateur traite les fichiers d'un autre.

**3 tentatives automatiques en cas d'échec :** configuré dans
defaultJobOptions de Bull, avec 5 secondes entre chaque tentative.

## Variables d'environnement requises
- REDIS_HOST
- REDIS_PORT

## Limitations connues (V1)
- Traitement actuellement simulé (délais artificiels) —
  les vrais services PDF seront branchés en S3
- Pas de notification email à la fin du job (V2)