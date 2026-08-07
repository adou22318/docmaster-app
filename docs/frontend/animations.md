# Animations d'entrée au Scroll — PDF DocMaster

## Présentation

Ce document décrit le système d'animation au scroll implémenté sur le frontend de l'application PDF DocMaster. Il permet de faire apparaître les éléments de manière fluide au fur et à mesure que l'utilisateur fait défiler la page.

## Stack technique choisie

- **react-intersection-observer** : Bibliothèque légère utilisée via le hook personnalisé `useScrollAnimation`.
- **CSS Vanilla (Tailwind étendu)** : Classes utilitaires personnalisées définies dans `index.css`.

### Pourquoi cette approche ?

| Avantages | Inconvénients / Limites |
| :--- | :--- |
| **Performance** : Utilise l'API native `IntersectionObserver` qui ne sollicite pas le thread principal. | **Complexité de synchronisation** : Gérer les délais (cascade) manuellement peut être fastidieux sur de très grandes listes. |
| **Légèreté** : Pas besoin de charger une lourde bibliothèque (comme Framer Motion ou GSAP) pour de simples effets d'apparition. | **Effets limités** : Moins adapté pour des animations complexes (ex: path svg, drag & drop physique). |
| **Maintenabilité** : Les classes CSS sont découplées de la logique React, ce qui permet de modifier le style indépendamment. | |

## Classes disponibles

Les classes suivantes ont été ajoutées dans `index.css` :

- `.animate-fade` : Apparition simple en fondu (idéal pour les titres).
- `.animate-fade-up` : Fondu + translation vers le haut (idéal pour les cartes).
- `.animate-slide-left` : Fondu + translation depuis la gauche (idéal pour les lignes de tableau).
- `.animate-scale` : Apparition avec léger zoom (idéal pour les modales et notifications).

### Délais en cascade

Pour animer des listes (comme la grille d'outils), des délais sont disponibles : `delay-0` jusqu'à `delay-6` (par incréments de 80ms). 
*Règle d'or : Jamais plus de 6 éléments en cascade pour ne pas frustrer l'utilisateur.*

## Accessibilité (prefers-reduced-motion)

Dans le fichier `index.css`, une règle CSS clé est implémentée :
```css
@media (prefers-reduced-motion: reduce) {
  /* Désactive les transitions */
}
```
**Fonctionnement :**
- Si cette règle est **présente** : Les utilisateurs ayant désactivé les animations au niveau de leur OS (ex: paramètres Windows ou mode économie d'énergie) verront les éléments apparaître instantanément. C'est la recommandation standard d'accessibilité (W3C).
- Si on **supprime** cette règle : Les animations seront forcées pour tous les utilisateurs, indépendamment des réglages de leur appareil. Bien que cela garantisse l'expérience visuelle, cela peut provoquer de l'inconfort pour les personnes souffrant de troubles vestibulaires.

*Décision du projet : La règle a été restaurée et est active en production.*
