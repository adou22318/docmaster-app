# Documentation Frontend : Page d'Accueil / Landing Page (V1)

## 1. Fichiers impliqués

| Fichier                                     | Rôle                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pages/Home.jsx`                            | Composant React de la page d'accueil publique.                                                                |
| `components/layout/PublicHeader.jsx`        | Header public avec les onglets (Accueil, Fonctionnalités, Tarifs, Aide) et les boutons Connexion/Inscription. |
| `components/layout/PublicFooter.jsx`        | Pied de page partagé.                                                                                         |
| `index.css`                                 | Classes utilitaires personnalisées (`.editorial-shadow`, `.ink-texture`).                                     |
| `code.html` _(fichier source, non déployé)_ | Template HTML fourni par Abdoulaye, servant de référence visuelle pour le design.                             |

---

## 2. Origine du design

Le design de la landing page a été fourni comme maquette sous forme d'un fichier `code.html` placé à la racine du projet. Ce fichier HTML statique a été intégralement converti en composant React JSX, en respectant scrupuleusement la structure, les classes CSS et l'esthétique éditoriale.

**Processus de conversion :**

1. Lecture et compréhension du HTML source (`code.html` — 369 lignes).
2. Conversion du `<main>` en JSX (adaptation des attributs HTML : `class` → `className`, `style` inline en objets JS, etc.).
3. Remplacement du `<script>` JavaScript vanilla par un `useEffect` React utilisant `IntersectionObserver`.
4. Remplacement du `<header>` et `<footer>` du HTML par les composants React existants (`PublicHeader`, `PublicFooter`) pour maintenir la cohérence avec le reste de l'application (boutons Connexion/Inscription au lieu de photo de profil).

**Note :** Le fichier `code.html` a été mis à jour deux fois par l'utilisateur. La première version contenait un design différent ; la version finale (celle intégrée) présente un style "éditorial" avec un Bento Grid pour les fonctionnalités et une section de réassurance "Bamako".

---

## 3. Structure de la page

La page est composée de 4 sections verticales :

### Section 1 — Hero

- Titre principal avec typographie Syne ("L'art du document, maîtrisé.")
- Sous-titre descriptif
- Deux CTA : "Démarrer gratuitement" (→ `/register`) et "Découvrir nos modules" (→ `#features`)
- Illustration abstraite à droite : composition géométrique avec icône `description` et effets de hover (rotation des cadres)

### Section 2 — Fonctionnalités (Bento Grid)

- Grille asymétrique `12 colonnes` avec 4 cartes :
  - **Conversion** (4 cols) — fond blanc, bordure
  - **Manipulation** (8 cols) — fond `primary` avec mini-preview de document
  - **Protection** (7 cols) — avec image en niveaux de gris qui se colorise au hover
  - **Signature** (5 cols) — fond `secondary-container`
- Chaque carte possède un effet de translation verticale au survol (`hover:-translate-y-1`)

### Section 3 — Réassurance / Trust

- Citation éditoriale ("La rigueur d'un ingénieur, l'œil d'un éditeur.")
- Badges ISO 27001, RGPD, eIDAS en niveaux de gris
- Mention de Bamako comme lieu de développement

### Section 4 — CTA Final

- Fond `primary` avec texture "papier naturel"
- Bouton de conversion final vers `/register`

---

## 4. Animations et micro-interactions

### Scroll-Reveal (IntersectionObserver)

Implémenté dans un `useEffect` React. Toutes les cartes portant la classe `.editorial-shadow` démarrent avec `opacity-0 translate-y-8` et transitionnent vers `opacity-100 translate-y-0` lorsqu'elles entrent dans le viewport (seuil : 10%).

### Effets de hover

- **Cartes Bento** : Translation verticale de -4px + changement de bordure
- **Illustration Hero** : Les cadres géométriques pivotent (`rotate-3` / `-rotate-3`)
- **Image Protection** : Passage de niveaux de gris à couleurs (`grayscale-0`)
- **Flèches directionnelles** : Translation horizontale de 8px (`translate-x-2`)

### Classes CSS personnalisées ajoutées à `index.css`

| Classe              | Rôle                                                                |
| ------------------- | ------------------------------------------------------------------- |
| `.editorial-shadow` | Ombre portée subtile (`box-shadow: 0 4px 40px rgba(26,28,30,0.08)`) |
| `.ink-texture`      | Texture de fond "papier naturel" via transparenttextures.com        |

---

## 5. Alternatives écartées

| Alternative                                                 | Raison du rejet                                                                                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Garder l'ancien hero avec image de fond                     | Le nouveau design "éditorial" fourni par Abdoulaye est visuellement supérieur et plus cohérent avec l'identité du produit.       |
| Utiliser une bibliothèque d'animations (AOS, Framer Motion) | `IntersectionObserver` natif est suffisant pour les besoins actuels (scroll-reveal simple), évite une dépendance supplémentaire. |
| Intégrer `code.html` via un `<iframe>`                      | Inacceptable : casse l'intégration React, le routage SPA, et empêche le partage de l'état d'authentification.                    |

---

## 6. Limitations connues

- **Images externes** : L'image de la carte "Protection" utilise une URL Google (lh3.googleusercontent.com). En production, elle devra être hébergée localement ou sur un CDN maîtrisé.
- **Texture externe** : La classe `.ink-texture` charge une image depuis transparenttextures.com. À remplacer par un asset local avant le déploiement.
- **Boutons carrousel non fonctionnels** : Les flèches gauche/droite de la section Fonctionnalités sont présentes visuellement mais ne déclenchent aucune action (pas de carrousel horizontal implémenté).
- **Liens "Tarifs" et "Aide"** : Les onglets du header public pointent vers `/pricing` et `/help`, mais ces pages ne sont pas encore créées (hors scope V1).
