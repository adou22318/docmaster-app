# Documentation Frontend : Architecture Layout & Navigation (V1)

## 1. Fichiers impliqués et leur rôle

| Fichier | Rôle |
|---------|------|
| `components/layout/AppLayout.jsx` | Layout principal de l'espace connecté (Dashboard). Englobe le `TopAppBar`, le contenu (`<Outlet />`) et le `PublicFooter`. |
| `components/layout/TopAppBar.jsx` | Header universel de l'espace connecté : logo, navigation, barre de recherche, actions (fichiers, notifications, paramètres, déconnexion), profil utilisateur. |
| `components/layout/PublicLayout.jsx` | Layout des pages publiques (accueil). Englobe le `PublicHeader`, le contenu et le `PublicFooter`. |
| `components/layout/PublicHeader.jsx` | Header de la page d'accueil publique : logo, onglets (Accueil, Fonctionnalités, Tarifs, Aide), boutons Connexion/Inscription. |
| `components/layout/PublicFooter.jsx` | Pied de page partagé entre les layouts public et connecté. |
| `components/layout/Sidebar.jsx` | **SUPPRIMÉ** — Ancienne barre latérale gauche du Dashboard. |

---

## 2. Décision retenue : Suppression de la Sidebar (Option A — "Header-Only")

### Contexte de la décision

Deux approches ont été évaluées pour la navigation de l'espace connecté :

| Critère | Option A — Header-Only | Option B — Sidebar compacte |
|---------|------------------------|-----------------------------|
| Espace horizontal disponible | ✅ Maximal (100% de la largeur pour les outils PDF) | ❌ Réduit de 80–280px |
| Responsivité mobile | ✅ Naturelle (le header s'adapte) | ❌ Nécessite un drawer/burger supplémentaire |
| Redondance de navigation | ✅ Aucune (un seul point de navigation) | ⚠️ Risque de duplication (paramètres dans sidebar + header) |
| Complexité de code | ✅ Faible (un seul composant) | ❌ Plus élevée (sidebar + toggle + état collapsed) |

### Décision retenue : **Option A**

**Justification :**
- L'utilisateur a signalé une redondance (paramètres/notifications présents à la fois dans la Sidebar et le TopAppBar), ce qui est contraire aux critères ergonomiques de Bastien & Scapin (concision, charge de travail minimale).
- L'espace horizontal maximal est critique pour les outils PDF (prévisualisation de pages, glisser-déposer, canvas de signature).
- Sur mobile, un header horizontal est nativement plus ergonomique qu'une sidebar qui nécessite un mécanisme de drawer supplémentaire.

### Résultat de la migration

Le `TopAppBar` a absorbé toutes les responsabilités de l'ancienne Sidebar :

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] DocMaster   │ Atelier │   🔍 Rechercher...   │ 📁 🔔 ⚙️ 🚪 │ Nom │ 👤 │
└──────────────────────────────────────────────────────────────────┘
```

- **Gauche** : Logo DocMaster (lien vers `/dashboard`) + onglet "Atelier"
- **Centre** : Barre de recherche (masquée en dessous de `lg`)
- **Droite** : Icônes d'action (Mes Fichiers, Notifications, Paramètres, Déconnexion) + Profil utilisateur

### Éléments de la Sidebar supprimés ou réaffectés

| Élément Sidebar | Destination |
|-----------------|-------------|
| Logo DocMaster | → TopAppBar (gauche) |
| Lien "Accueil" | → Onglet "Atelier" dans TopAppBar |
| Lien "Mes Fichiers" | → Icône `folder_open` dans TopAppBar (droite) |
| Lien "Paramètres" | → Icône `settings` dans TopAppBar (droite) |
| Lien "Aide" | → Conservé uniquement dans le footer |
| Bouton "Déconnexion" | → Icône `logout` dans TopAppBar (droite) |
| Toggle collapse | → Supprimé (plus nécessaire) |

---

## 3. Choix de design : "Mes Fichiers" en icône plutôt qu'en texte

**Problème signalé :** Le texte "Mes Fichiers" dans le header prenait trop d'espace horizontal, surtout sur les écrans de taille moyenne.

**Solution retenue :** Remplacement par l'icône Material Symbols `folder_open` avec un attribut `title="Mes Fichiers"` pour l'accessibilité (tooltip au survol).

**Justification :** Les autres actions (notifications, paramètres, déconnexion) utilisent déjà des icônes. L'uniformité améliore la lisibilité et réduit la charge cognitive (principe de cohérence de Bastien & Scapin).

---

## 4. Responsivité

### Breakpoints utilisés

| Breakpoint | Comportement |
|------------|-------------|
| `< sm` (640px) | Le nom de l'utilisateur est masqué (seul l'avatar reste visible) |
| `< md` (768px) | Le logo texte "DocMaster" et l'onglet "Atelier" sont masqués |
| `< lg` (1024px) | La barre de recherche est masquée |

### Limitations connues (V1)

- **Pas de menu hamburger mobile** : Sur les très petits écrans, les icônes d'action restent visibles mais peuvent être serrées. Un menu hamburger/drawer mobile n'est pas implémenté dans cette version.
- **Barre de recherche non fonctionnelle** : Le champ de recherche est présent visuellement mais n'est pas connecté à une logique de filtrage (hors scope V1).
