# Documentation — Système d'Abonnement et Paiement PayDunya

**Semaine :** S5 (nouveau)  
**Statut :** ✅ Intégré en mode sandbox (test)  
**Services :** [`payment.service.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/services/payment.service.js), [`checkSubscription.js`](file:///c:/Users/USER/Desktop/docmaster-app/backend/src/middlewares/checkSubscription.js)

---

## Plans disponibles

| Plan  | Accès | Durée |
|-------|-------|-------|
| Essai | Tous les outils SAUF `extract_images` | 7 jours automatiques à l'inscription |
| Pro   | Tous les outils + traitement prioritaire (Bull Queue priority 1) | Mensuel renouvelable |

---

## Période d'essai

À chaque inscription (classique ou OAuth Google), un enregistrement est automatiquement créé dans `abonnements` :

```sql
INSERT INTO abonnements (user_id, statut, plan, date_debut_essai, date_fin_essai)
VALUES ($1, 'essai', 'free', NOW(), NOW() + INTERVAL '7 days')
```

---

## Statuts d'abonnement

| Statut       | Signification |
|--------------|---------------|
| `essai`      | Période d'essai en cours (`date_fin_essai > NOW()`) |
| `actif`      | Plan Pro payé, valide (`date_fin_plan > NOW()`) |
| `expire`     | Essai ou plan Pro échu |
| `annule`     | Résiliation volontaire |
| `en_attente` | Paiement initié, webhook pas encore reçu |

La vérification est effectuée dans `getStatutAbonnement()` (payment.service.js) à chaque requête sur un outil protégé.

---

## Middleware `checkSubscription.js`

Appliqué sur toutes les routes d'upload et de traitement. Logique :

```
si PAYMENT_ENABLED=false → laisser passer (mode développement)
sinon :
  récupérer statut abonnement
  si statut=essai ET date_fin_essai > NOW() → autoriser
  si statut=actif ET date_fin_plan > NOW() → autoriser
  sinon → 403 ABONNEMENT_REQUIS
```

Certains outils nécessitent en plus `plan = 'pro'` (ex: `extract_images`). La vérification du plan est dans la route elle-même ou dans `ToolPage.jsx` côté frontend.

---

## Flux de paiement PayDunya

### Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/payments/initiate` | Crée un enregistrement paiement + appelle PayDunya API → retourne une URL de paiement |
| POST | `/api/payments/webhook` | Reçoit la confirmation PayDunya après paiement |
| POST | `/api/payments/confirm-return` | Confirmation directe au retour de l'utilisateur (complément au webhook) |

### Séquence d'un paiement réussi

```
1. Frontend → POST /api/payments/initiate
2. Backend → appel API PayDunya sandbox → retourne { payment_url }
3. Frontend → redirige l'utilisateur vers payment_url
4. Utilisateur → paie sur la page PayDunya (Orange Money, Wave, Moov...)
5. PayDunya → POST /api/payments/webhook (confirmation)
6. Backend → vérifie signature → UPDATE abonnements SET statut='actif', plan='pro'
7. Utilisateur → redirigé vers l'app → plan Pro activé
```

### Passerelles supportées (via PayDunya)

- Orange Money Mali
- Moov Money (SAMA Money)
- Wave

---

## Contrôle d'accès frontend

Dans `ToolPage.jsx`, la constante `OUTILS_PRO` liste les outils réservés aux abonnés Pro :

```js
const OUTILS_PRO = new Set(['extract_images']);
```

Si un utilisateur non-Pro accède à un outil Pro, la modale `ProGateModal` s'affiche avec les avantages du plan Pro et un bouton vers la page de tarification.

---

## Priorité dans la file d'attente (Bull Queue)

```js
// jobs.service.js
const priorite = plan === 'pro' ? 1 : 10;
queue.add(jobData, { priority: priorite });
```

Les jobs Pro sont traités en priorité devant les jobs Free/Essai.

---

## État actuel du paiement

L'intégration PayDunya est complète et fonctionnelle en **mode sandbox (test)**.  
Le basculement en mode live (`PAYDUNYA_MODE=live`) est prévu après déploiement de l'API sur une infrastructure de production (nécessaire pour la réception des webhooks via URL publique).

La variable d'environnement `PAYMENT_ENABLED=false` permet de désactiver entièrement le système d'abonnement en développement local.

---

## Variables d'environnement requises

```env
PAYMENT_ENABLED=true
PAYDUNYA_MASTER_KEY=...
PAYDUNYA_PRIVATE_KEY=...
PAYDUNYA_TOKEN=...
PAYDUNYA_MODE=test        # ou live pour la production
```
