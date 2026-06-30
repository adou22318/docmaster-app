# Nettoyage automatique — DocMaster

**Date :** [date du jour]
**Semaine :** S2
**Statut :** ✅ Complet (désactivé fonctionnellement — voir note)

## Vue d'ensemble
Script qui supprime automatiquement les fichiers expirés (disque + BDD)
toutes les heures.

## Fonctionnement
`setInterval` exécute `nettoyerFichiersExpires()` toutes les 3 600 000ms
(1 heure), avec un premier passage immédiat au démarrage du serveur.

## Note importante
Suite à la décision de rendre la connexion obligatoire pour tout
upload, le champ `expire_le` n'est plus renseigné automatiquement
(toujours NULL). Le cron reste fonctionnel et testé, prêt à être
réactivé pour une politique de rétention future (ex: purge des
résultats de jobs non téléchargés après 7 jours).


## Test effectué
Upload normal d'un fichier (connexion requise), puis expiration
forcée manuellement via UPDATE SQL sur le champ expire_le, suivi
du déclenchement du nettoyage via route de test temporaire
(supprimée avant commit). Suppression confirmée en BDD et sur disque.