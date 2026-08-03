# Documentation Frontend : Authentification (V1)

## 1. Fichiers créés et leur rôle

L'architecture d'authentification frontend a été construite de manière modulaire, en séparant l'interface utilisateur, la gestion d'état global et la logique de requêtage réseau :

- **`frontend/src/store/useAuthStore.js`** : Store global créé avec Zustand. Il gère l'état de l'utilisateur (`user`, `accessToken`, `isLoading`, `error`). C'est le chef d'orchestre qui fait le pont entre l'UI et l'API.
- **`frontend/src/services/api/axiosClient.js`** : Instance Axios centralisée équipée d'intercepteurs. Elle s'occupe d'injecter automatiquement l'`accessToken` dans les requêtes sortantes, et d'intercepter les erreurs `401` pour tenter un rafraîchissement silencieux du token (mécanisme de file d'attente pour bloquer les requêtes pendant le refresh).
- **`frontend/src/services/api/authApi.js`** : Couche d'abstraction contenant les appels réseau purs vers le backend (`loginApi`, `registerApi`, `refreshApi`, `logoutApi`).
- **`frontend/src/pages/Login.jsx`** : Interface de connexion avec un design "Editorial/Vitrine" (asymétrique).
- **`frontend/src/pages/Register.jsx`** : Interface d'inscription avec validations des champs et gestion des erreurs.
- **`frontend/src/pages/AuthCallback.jsx`** : Page technique "tampon" utilisée après une redirection OAuth (Google). Elle extrait les tokens de l'URL, les enregistre, affiche une animation fluide (1.2s) puis redirige vers le Dashboard.
- **`frontend/src/components/auth/ProtectedRoute.jsx`** : Gardien de route (Route Guard) qui englobe le Dashboard. Il affiche un écran de chargement (le temps que `initializeAuth` vérifie le refresh token au démarrage) et redirige vers `/login` si l'utilisateur n'est pas authentifié.

---

## 2. Décision retenue sur le stockage des tokens

**Stratégie implémentée :**
- **Access Token** : Stocké **uniquement en mémoire** (dans l'état Zustand).
- **Refresh Token** : Stocké dans le **`localStorage`**.

**Justification de sécurité et d'UX :**
C'est le compromis optimal pour une application type SaaS (SPA React) :
1. *Sécurité (XSS)* : En ne stockant pas l'`accessToken` dans le `localStorage`, un script malveillant (XSS) a beaucoup plus de mal à l'exfiltrer, car il n'est présent que dans la variable d'environnement de React. 
2. *Expérience Utilisateur (UX)* : Le `refreshToken` placé dans le `localStorage` permet de survivre à un rafraîchissement de la page (F5) ou à une fermeture du navigateur. Au prochain démarrage, l'application utilise silencieusement ce `refreshToken` pour redemander un nouvel `accessToken` valide, de manière totalement transparente pour l'utilisateur.

---

## 3. Décision retenue sur la redirection post-inscription

**Stratégie implémentée :** Connexion automatique et redirection directe vers l'Atelier (Dashboard).

**Justification :** 
Afin de minimiser la friction à l'embarquement (onboarding), nous avons choisi de ne pas forcer l'utilisateur à se reconnecter manuellement après avoir créé son compte, ni de bloquer son accès en attendant une validation d'email (hors scope pour la V1). Dès l'inscription réussie, le store appelle automatiquement la fonction de login en arrière-plan et l'utilisateur atterrit directement sur son espace de travail, prêt à utiliser les outils PDF.

---

## 4. Validations côté client implémentées

Pour offrir un retour immédiat et éviter des requêtes inutiles au serveur, des vérifications strictes sont faites sur la page `Register.jsx` avant la soumission du formulaire :

- **Nom complet** : Doit faire au moins 2 caractères.
- **Email** : Validation standard via l'attribut HTML `type="email"`.
- **Mot de passe** : 
  - Doit comporter au moins 8 caractères (cohérent avec les règles backend).
  - Doit correspondre exactement au champ "Confirmation".
- **Nettoyage (Trim)** : Les espaces inutiles avant/après l'email et le nom sont automatiquement supprimés (`.trim()`) avant l'envoi.

---

## 5. Cas d'erreur gérés

Toute l'interface réagit de manière contextuelle aux retours du backend :

- **Identifiants invalides (401)** : Sur le `Login`, l'erreur générique *"Email ou mot de passe incorrect"* s'affiche sans préciser lequel des deux est faux (règle de sécurité stricte pour empêcher l'énumération de comptes).
- **Email déjà utilisé (409)** : Sur le `Register`, une alerte prévient l'utilisateur que l'adresse est déjà associée à un compte.
- **Compte OAuth (400)** : Si un utilisateur tente de se connecter avec un email et un mot de passe alors que son compte a été créé via Google, l'API renvoie une erreur spécifique demandant d'utiliser le bouton Google.
- **Expiration de session** : Si le refresh token est invalide, révoqué ou absent lors d'un rafraîchissement de page, la session est nettoyée localement et l'utilisateur est renvoyé gracieusement vers le `/login`.

---

## 6. Limitations connues

Bien que l'authentification soit robuste, il existe certaines limitations identifiées pour cette version (qui respectent le périmètre défini) :

- **Déconnexion multi-appareils** : Actuellement, se déconnecter (Logout) ne révoque que le `refreshToken` de l'appareil courant. Si l'utilisateur est connecté sur son téléphone et sur son ordinateur, il devra se déconnecter manuellement sur les deux. Il n'y a pas d'interface permettant de "Déconnecter tous les autres appareils".
- **Expiration immédiate de l'Access Token** : Lors d'une déconnexion, l'`accessToken` (valide 15 minutes) n'est pas détruit côté serveur (car les JWT sont stateless). L'utilisateur est déconnecté localement, mais techniquement, ce jeton de 15 minutes pourrait encore être utilisé sur l'API s'il était intercepté, jusqu'à son expiration naturelle.
- **Pas de vérification d'email** : Les comptes créés sont immédiatement actifs sans mécanisme "Double Opt-In" (lien de confirmation par email), conformément au périmètre strict de cette soutenance.
