

# Page 1

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 1  |  Mali Développeur  |  Projet de Licence 2025-2026 
MALI DÉVELOPPEUR 
Agence Web et de Communication digitale 
CAHIER DES CHARGES 
Projet de Soutenance de Licence  
 
PDF DocMaster 
Suite de Gestion, Manipulation et Sécurisation de Documents PDF 
Établissement  
Ecole Nationale d’Ingénieurs Abderhamane Baba Touré (ENI-ABT) 
Entreprise d’accueil  
Mali développeur Sarl 
Filière 
Génie Informatique et Télécommunications (G.I.T) 
Auteur 
Abdoulaye MAÏGA 
Date 
12 Mai 2026 
 
 


# Page 2

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 2  |  Mali Développeur  |  Projet de Licence 2025-2026 
  SOMMAIRE 
 
1.  Contexte et Présentation du Projet 
2.  Objectifs du Projet 
3.  Périmètre Fonctionnel 
    3.1  Module 1 — Conversion de Documents 
    3.2  Module 2 — Manipulation de Pages 
    3.3  Module 3 — Compression et Protection 
    3.4  Module 4 — Signature Électronique Simple 
4.  Spécifications Techniques 
    4.1  Architecture Générale 
    4.2  Technologies Retenues (100% Gratuit) 
    4.3  Hébergement 
5.  Modèle de Données 
6.  Sécurité et Contraintes 
7.  Planning et Jalons 
8.  Livrables Attendus 
9.  Risques et Mitigations 
10.  Glossaire 
 
 


# Page 3

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 3  |  Mali Développeur  |  Projet de Licence 2025-2026 
  1. CONTEXTE ET PRÉSENTATION DU PROJET 
 
1.1 Contexte Général 
Dans le cadre de la soutenance de Licence (Bac+3) au sein de la structure Mali Développeur, 
Abdoulaye Maiga présente le projet PDF DocMaster. Ce projet s’inscrit dans une démarche de 
réponse à un besoin concret : offrir aux particuliers, aux étudiants et aux professionnels maliens 
un outil numérique simple et gratuit pour manipuler leurs documents PDF, sans dépendre de 
services en ligne payants ou de connexion internet permanente. 
 
La popularité croissante du format PDF dans les administrations, les universités et les entreprises 
au Mali rend ce type d’outil particulièrement pertinent. L’application s’inspire des grandes 
plateformes internationales telles que Smallpdf, ILovePDF ou Adobe Acrobat, tout en étant 
conçue avec des technologies entièrement gratuites et open-source. 
 
1.2 Présentation du Projet 
PDF DocMaster est une application web SaaS (Software as a Service) monopage permettant de 
réaliser les opérations les plus courantes sur des fichiers PDF : conversion, manipulation de 
pages, compression, protection par mot de passe et apposition d’une signature électronique 
simple. 
 
L’application est conçue pour fonctionner en mode client-serveur, avec un traitement côté serveur 
pour les opérations lourdes et une interface utilisateur fluide côté client. 
 
 


# Page 4

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 4  |  Mali Développeur  |  Projet de Licence 2025-2026 
  2. OBJECTIFS DU PROJET 
 
2.1 Objectif Principal 
Développer et déployer une application web de gestion de documents PDF, fonctionnelle et 
utilisable en production, dans un délai de 3 à 6 mois, en utilisant exclusivement des technologies 
open-source et des services d’hébergement gratuits. 
 
2.2 Objectifs Secondaires 
• 
Démontrer la maîtrise de l’architecture full-stack (Node.js + React.js) 
• 
Mettre en œuvre une gestion de file d’attente pour les traitements asynchrones 
• 
Implémenter un système d’authentification sécurisé (JWT + OAuth Google) 
• 
Respecter les bonnes pratiques de sécurité (HTTPS, chiffrement, nettoyage 
automatique) 
• 
Produire une documentation technique et fonctionnelle complète 
• 
Présenter un produit fini et déployable, pas seulement une démonstration 
 
2.3 Périmètre Exclu (hors scope) 
Afin de garantir la faisabilité individuelle du projet, les éléments suivants sont explicitement exclus 
de cette première version : 
• 
Conversion PDF → Word/Excel de haute-fidélité (nécessite un SDK payant) 
• 
Éditeur WYSIWYG avancé (modification directe du texte dans le PDF) 
• 
Signature électronique juridiquement certifiée (eIDAS) 
• 
Intégrations cloud (Google Drive, Dropbox, OneDrive) 
• 
Extension navigateur 
• 
Application mobile native 
 
 


# Page 5

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 5  |  Mali Développeur  |  Projet de Licence 2025-2026 
  3. PÉRIMÈTRE FONCTIONNEL 
 
L’application est organisée en 4 modules fonctionnels principaux, tous réalisables sans budget 
avec les technologies retenues. 
 
3.1 Module 1 — Conversion de Documents 
3.1.1 Fonctionnalités incluses 
• 
Images (JPG, PNG, BMP) → PDF : fusion d’une ou plusieurs images en un seul fichier 
PDF 
• 
PDF → Images (JPG/PNG) : export de chaque page du PDF en fichier image 
• 
Formats Office → PDF : conversion de fichiers DOCX, XLSX, PPTX en PDF via 
LibreOffice headless 
• 
PDF → TXT : extraction du texte brut d’un PDF 
 
3.1.2 Contraintes techniques 
• 
Taille maximale de fichier acceptée : 50 Mo 
• 
Traitement asynchrone obligatoire (file d’attente Bull/Redis) 
• 
Notification à l’utilisateur à la fin du traitement 
• 
Téléchargement automatique du fichier résultat 
 
3.2 Module 2 — Manipulation de Pages 
3.2.1 Fonctionnalités incluses 
• 
Fusion de plusieurs PDF : combiner 2 fichiers PDF ou plus en un seul document 
• 
Division d’un PDF : séparer un PDF selon une plage de pages définie par l’utilisateur 
• 
Extraction de pages : sélectionner et extraire des pages spécifiques 
• 
Rotation de pages : rotation à 90°, 180° ou 270°, page par page ou globalement 
• 
Réorganisation par glisser-déposer : interface visuelle de tri des pages 
• 
Suppression de pages : retirer une ou plusieurs pages sélectionnées 
 
3.2.2 Contraintes techniques 
• 
Visualisation miniature (thumbnail) de chaque page avant traitement 
• 
Annulation possible avant confirmation 
• 
Traitement côté serveur via pdf-lib 
 
3.3 Module 3 — Compression et Protection 
3.3.1 Compression 
• 
3 niveaux de compression : élevée, moyenne, basse 
• 
Affichage de la taille avant / après compression 
• 
Moteur : Ghostscript (via CLI) 


# Page 6

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 6  |  Mali Développeur  |  Projet de Licence 2025-2026 
 
3.3.2 Protection et Sécurité 
• 
Ajout d’un mot de passe d’ouverture (chiffrement AES-256 via qpdf) 
• 
Suppression du mot de passe sur un PDF protégé (avec saisie du mot de passe actuel) 
• 
Ajout de filigrane texte : texte personnalisable, opacité, angle, position 
• 
Nettoyage des métadonnées : suppression des informations cachées du PDF 
 
3.4 Module 4 — Signature Électronique Simple 
3.4.1 Fonctionnalités incluses 
• 
Création de signature : dessin libre sur canvas (souris ou tactile) 
• 
Import de signature : téléchargement d’une image de signature (PNG transparent) 
• 
Signature en texte : saisie du nom avec une police calligraphique 
• 
Positionnement libre : placement de la signature à l’endroit souhaité sur la page 
• 
Ajout de la date : insertion automatique de la date du jour à côté de la signature 
• 
Téléchargement du PDF signé 
 
3.4.2 Limitation importante 
⚠️  Avertissement : La signature fournie par ce module est une signature électronique simple 
(apposition d’une image). Elle n’a pas de valeur juridique certifiée (ne respecte pas la norme 
eIDAS). Cela sera clairement mentionné à l’utilisateur dans l’interface. 
 
3.5 Tableau Récapitulatif des Fonctionnalités 
 
Module 
Fonctionnalité 
Priorité 
Complexité 
Module 1 
Images → PDF 
Haute 
Faible 
Module 1 
Office → PDF 
Haute 
Faible 
Module 1 
PDF → Images 
Moyenne 
Faible 
Module 1 
PDF → TXT 
Faible 
Faible 
Module 2 
Fusion de PDF 
Haute 
Faible 
Module 2 
Division / Extraction 
Haute 
Moyenne 
Module 2 
Réorganisation par drag & drop 
Haute 
Moyenne 
Module 2 
Rotation de pages 
Moyenne 
Faible 
Module 3 
Compression (3 niveaux) 
Haute 
Faible 


# Page 7

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 7  |  Mali Développeur  |  Projet de Licence 2025-2026 
Module 3 
Protection par mot de passe 
Haute 
Faible 
Module 3 
Filigrane texte 
Moyenne 
Faible 
Module 3 
Nettoyage métadonnées 
Faible 
Faible 
Module 4 
Signature dessinée 
Haute 
Moyenne 
Module 4 
Signature par image importée 
Moyenne 
Faible 
Module 4 
Positionnement libre 
Haute 
Moyenne 
 
 


# Page 8

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 8  |  Mali Développeur  |  Projet de Licence 2025-2026 
  4. SPÉCIFICATIONS TECHNIQUES 
 
4.1 Architecture Générale 
L’application suit une architecture client-serveur classique en trois couches : 
 
Couche 
Technologie 
Rôle 
Présentation 
React.js + Tailwind CSS 
Interface utilisateur, upload, affichage des résultats 
Logique métier 
Node.js + Express.js 
API REST, gestion des traitements, file d’attente 
Données 
PostgreSQL 
+ 
Redis 
+ 
Stockage local 
Utilisateurs, sessions, fichiers temporaires 
 
4.2 Technologies Retenues (100% Gratuit / Open-Source) 
 
Catégorie 
Bibliothèque 
Usage 
Licence 
PDF Core 
pdf-lib 
Fusion, division, rotation, filigrane, 
signature 
MIT (Gratuit) 
PDF Core 
pdf-parse 
Extraction de texte 
MIT (Gratuit) 
PDF Core 
PDF.js (Mozilla) 
Visualisation dans le navigateur 
Apache 2.0 (Gratuit) 
Compression 
Ghostscript 
Compression avancée PDF 
GPL (Gratuit) 
Sécurité 
qpdf 
Chiffrement AES-256 
Apache 2.0 (Gratuit) 
Conversion 
LibreOffice headless 
Office → PDF (DOCX, XLSX, PPTX) 
LGPL (Gratuit) 
Images 
sharp 
Images → PDF, PDF → Images 
Apache 2.0 (Gratuit) 
Signature 
Canvas API (natif) 
Dessin de signature côté client 
Natif HTML5 
File d’attente 
Bull + Redis 
Traitements asynchrones 
MIT (Gratuit) 
Auth 
jsonwebtoken 
+ 
Passport.js 
JWT + OAuth Google 
MIT (Gratuit) 
Frontend 
React.js + Vite 
Interface SPA 
MIT (Gratuit) 
UI 
Tailwind 
CSS 
+ 
shadcn/ui 
Design système 
MIT (Gratuit) 


# Page 9

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 9  |  Mali Développeur  |  Projet de Licence 2025-2026 
Drag & Drop 
dnd-kit 
Réorganisation de pages 
MIT (Gratuit) 
 
4.3 Hébergement (Solutions Gratuites) 
• 
Backend (Node.js + Redis) : Render.com — plan gratuit suffisant pour la soutenance 
• 
Base de données PostgreSQL : Supabase — plan gratuit jusqu’à 500 Mo 
• 
Frontend (React) : Vercel ou Netlify — déploiement CDN gratuit 
• 
Stockage de fichiers temporaires : système de fichiers local sur le serveur + nettoyage 
automatique à 24h 
 
⚠️  Note : Ces solutions gratuites sont suffisantes pour la démonstration et la soutenance. Un 
passage en production commerciale nécessiterait un hébergement payé. 
 
 


# Page 10

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 10  |  Mali Développeur  |  Projet de Licence 2025-2026 
  5. MODÈLE DE DONNÉES 
 
5.1 Entités Principales 
Table : users 
Champ 
Type 
Description 
id 
UUID (PK) 
Identifiant unique 
email 
VARCHAR(255) 
Adresse email (unique) 
password_hash 
TEXT 
Mot de passe haché (bcrypt) 
provider 
VARCHAR(50) 
local | google 
created_at 
TIMESTAMP 
Date de création du compte 
storage_used_mb 
FLOAT 
Espace utilisé (Mo) 
 
Table : jobs (file d’attente) 
Champ 
Type 
Description 
id 
UUID (PK) 
Identifiant du job 
user_id 
UUID (FK) 
Référence utilisateur 
type 
VARCHAR(50) 
Type d’opération (merge, compress...) 
status 
ENUM 
pending | processing | done | error 
input_path 
TEXT 
Chemin fichier entrée 
output_path 
TEXT 
Chemin fichier résultat 
created_at 
TIMESTAMP 
Date de soumission 
completed_at 
TIMESTAMP 
Date de fin de traitement 
 
 


# Page 11

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 11  |  Mali Développeur  |  Projet de Licence 2025-2026 
  6. SÉCURITÉ ET CONTRAINTES 
 
6.1 Sécurité des Données 
• 
Tous les échanges chiffrés via TLS 1.3 (HTTPS obligatoire) 
• 
Mots de passe hachés avec bcrypt (facteur de coût : 12) 
• 
Tokens JWT avec expiration (access token : 15min, refresh token : 7 jours) 
• 
Validation et sanitisation de tous les fichiers reçus (type MIME vérifié côté serveur) 
• 
Nettoyage automatique des fichiers temporaires après 24 heures (script cron) 
• 
Limitation du nombre de requêtes (rate limiting : 20 requêtes/minute par IP) 
 
6.2 Contraintes Non-Fonctionnelles 
Critère 
Exigence 
Performance 
Temps de réponse < 3 secondes pour opérations simples (fusion ≤ 5 pages) 
Disponibilité 
Application accessible 24h/24 en période de soutenance 
Compatibilité 
Navigateurs : Chrome, Firefox, Edge (versions récentes) 
Accessibilité 
Interface responsive (desktop + tablette) 
Taille fichier 
Maximum 50 Mo par fichier soumis 
Langues 
Interface en français uniquement (V1) 
 
 


# Page 12

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 12  |  Mali Développeur  |  Projet de Licence 2025-2026 
  7. PLANNING ET JALONS 
 
Le projet est divisé en 4 phases sur une durée de 4 mois (plan nominal). Une marge de 2 mois 
est prévue pour absorber les imprévus. 
 
Phase 
Durée 
Intitulé 
Livrables 
1 
Semaines 1-3 
Mise en place & 
Architecture 
Environnement de développement, structure du projet, 
BDD initialisée, authentification fonctionnelle 
2 
Semaines 4-8 
Backend — Modules 1 
& 2 
API REST complète pour conversion et manipulation de 
pages, file d’attente Bull/Redis opérationnelle 
3 
Semaines 9-
12 
Backend — Modules 3 
& 4 
Compression, protection, filigrane, signature simples 
fonctionnels 
4 
Semaines 13-
16 
Frontend & Intégration 
Interface 
React 
complète, 
tests, 
déploiement, 
documentation finale 
 
 


# Page 13

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 13  |  Mali Développeur  |  Projet de Licence 2025-2026 
  8. LIVRABLES ATTENDUS 
 
8.1 Livrables Techniques 
1. Code source complet (dépôt Git public ou privé avec accès encadrant) 
2. Application déployée et accessible via URL publique 
3. Base de données initialisée avec données de test 
4. Documentation technique : diagramme d’architecture, modèle de données, guide 
d’installation 
5. Documentation API (Swagger / OpenAPI ou Postman Collection) 
6. Tests unitaires sur les fonctions critiques (taux de couverture ≥ 60%) 
 
8.2 Livrables Académiques 
7. Ce cahier des charges (document présent) 
8. Rapport de projet (30 à 50 pages) : contexte, choix techniques, difficultés rencontrées, 
perspectives 
9. Présentation PowerPoint de soutenance (15 à 20 diapositives) 
10. Démonstration live de l’application lors de la soutenance 
 
 


# Page 14

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 14  |  Mali Développeur  |  Projet de Licence 2025-2026 
  9. RISQUES ET MITIGATIONS 
 
Risque identifié 
Niveau 
Impact potentiel 
Stratégie de mitigation 
Qualité médiocre de la 
conversion Office→PDF via 
LibreOffice 
 Moyen 
Fonctionnalité moins 
impressionnante 
Tester plusieurs documents, 
documenter les limites, noter 
explicitement dans l’interface 
Serveur gratuit (Render) trop 
lent pour les gros fichiers 
 Moyen 
Mauvaise expérience lors de la 
soutenance 
Préparer des fichiers PDF 
légers (≤10 Mo) pour la 
démonstration 
Temps de développement 
sous-estimé 
 Haut 
Fonctionnalités incomplètes à 
la soutenance 
Prioriser strictement les 
fonctions haute priorité, reporter 
les basses 
Difficulté avec la mise en place 
de Bull/Redis 
 Moyen 
Traitements synchrones 
bloquants 
Alternative : traitement 
synchrone avec feedback visuel 
(spinner) 
Panne du service 
d’hébergement gratuit 
 Faible 
Application inaccessible le jour J 
Avoir un déploiement de 
secours local (localhost + 
ngrok) 
 
 


# Page 15

PDF DocMaster  |  Cahier des Charges  |  Abdoulaye Maiga 
Page 15  |  Mali Développeur  |  Projet de Licence 2025-2026 
  10. GLOSSAIRE 
 
Terme 
Définition 
API REST 
Interface de programmation basée sur le protocole HTTP, permettant la 
communication entre le frontend et le backend 
AES-256 
Standard de chiffrement symétrique sur 256 bits, utilisé pour protéger les fichiers 
PDF par mot de passe 
Bull / Redis 
Bull est une bibliothèque Node.js de gestion de file d’attente basée sur Redis. 
Utilisée pour les traitements asynchrones. 
CRON 
Script planifié s’exécutant automatiquement à intervalle régulier (ici : suppression 
des fichiers temporaires) 
JWT 
JSON Web Token : mécanisme d’authentification sans session serveur, basé sur 
des tokens signés 
LibreOffice headless 
Version de LibreOffice s’exécutant sans interface graphique, utilisée pour 
convertir des fichiers Office en PDF 
OAuth 2.0 
Protocole d’autorisation permettant à un utilisateur de se connecter avec son 
compte Google 
PDF 
Portable Document Format : format de fichier indépendant du système 
d’exploitation, créé par Adobe 
pdf-lib 
Bibliothèque JavaScript (MIT) permettant de créer et modifier des fichiers PDF 
côté serveur 
Rate Limiting 
Limitation du nombre de requêtes par unité de temps pour prévenir les abus 
SaaS 
Software as a Service : modèle de distribution logicielle via internet, sans 
installation locale 
TLS 1.3 
Transport Layer Security : protocole de chiffrement des communications entre le 
navigateur et le serveur (HTTPS) 
WYSIWYG 
What You See Is What You Get : éditeur où l’affichage correspond exactement 
au résultat final 
 
Document préparé par Abdoulaye Maïga — Projet de Licence — Mali Développeur — 2025–2026 
Ce document est confidentiel et destiné à l’usage académique exclusivement. 
 
