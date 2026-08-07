# Dashboard Dynamique — PDF DocMaster

## Présentation

Le Dashboard a été rendu entièrement interactif et branché sur l'API, offrant une véritable expérience d'« Atelier de travail » à l'utilisateur.

## Structure et Centralisation (`tools.js`)

Pour simplifier la maintenance, un fichier `src/data/tools.js` a été créé comme source de vérité unique. 
**Convention :** Chaque outil contient des propriétés strictes (id, nom, icone, catégorie, route, populaire, accepteMultiple). Ainsi, si de nouveaux outils sont développés plus tard, il suffira de les ajouter dans ce tableau, et le dashboard (onglets, filtres, outils suggérés) se mettra à jour automatiquement.

## Filtrage Hybride (Recherche + Catégorie)

Le composant `DashboardTools.jsx` utilise désormais une approche d'affichage *hybride*.

### Décision sur l'approche (Onglets + Scroll vs Nav)

Initialement, les onglets provoquaient un rechargement de page (`<Link>`). Cela a été remplacé par un filtrage local sur place (état `categorieActive`) pour deux raisons :
1. **Performance perçue** : Filtrer le tableau d'outils localement prend 1 milliseconde, contre le chargement d'une nouvelle page complète.
2. **Affichage Hybride** : Permet d'afficher tous les outils classés par catégorie lorsqu'aucun onglet spécifique n'est sélectionné ("Tous les outils").

### Logique de recherche
La recherche est gérée via un `useMemo` qui combine le filtre de catégorie et le filtre textuel (recherche insensible à la casse sur le titre et la description de l'outil). Ce double filtrage est exécuté en temps réel (à chaque frappe).

## Synchronisation Upload → Liste des Fichiers Récents

Le composant `DropZone.jsx` gère l'upload complet.
1. La validation (poids et format) est faite côté client immédiatement.
2. L'appel vers `POST /files/upload` est lancé.
3. Si réussi, un compteur de version globale (`filesVersion`) est incrémenté dans le store Zustand (`useFileStore`).
4. Le composant `RecentFiles.jsx` possède un `useEffect` qui écoute cette valeur `filesVersion`. À chaque changement (suite à un upload, ou une suppression), il relance un fetch de l'API.

## Bugs Corrigés et Améliorations UX

- **Onglets parasites** : Remplacement des `Link` React-Router par des balises `button` pour empêcher un changement d'URL inutile lors du filtrage.
- **Conflits de noms dans le store** : Correction de l'erreur React *“Functions are not valid as a React child”* (propriété et action Zustand portant le même nom).
- **Accessibilité des boutons** : Les boutons décrivent désormais clairement l'action finale ("Supprimer définitivement", "Oui, annuler" au lieu de simples "Oui", "Non").
- **Alertes d'erreur** : Chaque alerte erreur peut être ignorée d'un clic (règle UX globale de l'application).

## Limitations Connues

Conformément au périmètre strict du projet (PRD), certaines fonctionnalités visibles côté client restent en attente :
- **Import via URL** : Bouton affiché (en état idle) mais non câblé (hors scope actuel).
- **Bouton Partager (Fichiers Récents)** : Une alerte simple annonce que la fonctionnalité sera disponible prochainement.
