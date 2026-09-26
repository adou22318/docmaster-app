import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    categorie: 'Compte & Abonnement',
    icon: 'manage_accounts',
    items: [
      {
        q: "Quels sont les plans disponibles ?",
        a: "DocMaster propose deux plans : un plan Gratuit avec 7 jours d'essai (500 Mo de stockage, tous les outils de base) et un plan Pro à 5 000 XOF/mois (5 Go de stockage, outils avancés comme l'extraction d'images, traitements prioritaires et support dédié)."
      },
      {
        q: "Comment passer au plan Pro ?",
        a: "Rendez-vous sur la page Tarifs et cliquez sur « Passer au Pro ». Vous serez redirigé vers PayDunya pour effectuer le paiement via Mobile Money (Orange Money, Moov Money, MTN…). Aucun compte PayDunya n'est requis — vous payez directement depuis votre numéro mobile money."
      },
      {
        q: "Que se passe-t-il après la période d'essai ?",
        a: "Après 7 jours, si vous n'avez pas souscrit au plan Pro, certaines fonctionnalités avancées seront restreintes. Vos fichiers traités restent néanmoins sous votre contrôle dans votre espace."
      },
      {
        q: "Comment annuler mon abonnement ?",
        a: "Vous pouvez annuler à tout moment depuis vos paramètres de compte. L'annulation prend effet à la fin de la période de facturation en cours."
      }
    ]
  },
  {
    categorie: 'Fichiers & Stockage',
    icon: 'folder_open',
    items: [
      {
        q: "Où sont stockés mes fichiers ?",
        a: "Tous les fichiers sont stockés de manière sécurisée sur notre serveur backend. Conformément à notre politique stricte (Privacy-First), c'est vous qui avez la main pour les supprimer manuellement quand vous n'en avez plus besoin."
      },
      {
        q: "Quelle est la taille maximale d'un fichier ?",
        a: "La limite est fixée à 50 Mo par fichier pour garantir de bonnes performances. Le plan Gratuit inclut 500 Mo de quota total, le plan Pro offre 5 Go."
      },
      {
        q: "Quels formats de fichiers sont acceptés ?",
        a: "DocMaster accepte les PDF pour la plupart des outils. Pour la conversion, vous pouvez importer des fichiers Word (.docx), Excel (.xlsx), PowerPoint (.pptx), ainsi que des images (PNG, JPG, WEBP)."
      }
    ]
  },
  {
    categorie: 'Outils PDF',
    icon: 'picture_as_pdf',
    items: [
      {
        q: "Quels outils sont inclus dans le plan Gratuit ?",
        a: "Tous les outils de base : fusion, division, rotation, suppression de pages, compression, protection par mot de passe, filigrane, conversion Office → PDF, signature électronique simple, et plus encore."
      },
      {
        q: "Quels outils sont réservés au plan Pro ?",
        a: "L'extraction d'images embarquées dans un PDF est actuellement réservée aux abonnés Pro. D'autres outils avancés pourront rejoindre cette catégorie dans les prochaines mises à jour."
      },
      {
        q: "La signature électronique a-t-elle une valeur légale ?",
        a: "DocMaster propose une signature visuelle simple (dessin, image ou texte calligraphique). Elle n'a pas la valeur juridique d'une signature eIDAS certifiée, mais convient parfaitement pour les processus internes, accords informels et documents académiques."
      },
      {
        q: "Comment réorganiser les pages de mon PDF ?",
        a: "Utilisez l'outil « Réorganisation de pages » pour glisser-déposer les pages dans l'ordre souhaité. Vous pouvez aussi ajouter des pages vierges (au début, à la fin ou après une page spécifique)."
      }
    ]
  },
  {
    categorie: 'Sécurité & Confidentialité',
    icon: 'security',
    items: [
      {
        q: "Mes fichiers sont-ils partagés avec des tiers ?",
        a: "Non. Vos fichiers sont traités exclusivement sur nos serveurs et ne sont jamais partagés, vendus ou analysés par des tiers. Vous pouvez les supprimer à tout moment via votre tableau de bord."
      },
      {
        q: "Le paiement est-il sécurisé ?",
        a: "Oui. Les paiements sont traités par PayDunya, une passerelle de paiement certifiée pour l'Afrique de l'Ouest. DocMaster ne stocke jamais vos informations bancaires ou de mobile money."
      },
      {
        q: "Comment puis-je supprimer mon compte ?",
        a: "Rendez-vous dans Paramètres → Supprimer mon compte. Cette action est irréversible et supprime toutes vos données personnelles ainsi que vos fichiers."
      }
    ]
  }
];

const FaqCategorie = ({ categorie, icon, items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <h2 className="text-lg font-bold text-on-surface">{categorie}</h2>
      </div>
      {items.map((item, i) => (
        <div key={i}
          className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            openIndex === i ? 'border-primary/30 bg-primary/5' : 'border-outline-variant bg-surface-container'
          }`}>
          <button
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="text-sm font-semibold text-on-surface">{item.q}</span>
            <span className={`material-symbols-outlined text-[20px] flex-shrink-0 transition-transform duration-200 ${
              openIndex === i ? 'text-primary rotate-180' : 'text-on-surface-variant'
            }`}>expand_more</span>
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4">
              <p className="text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const HelpPage = () => {
  return (
    <div className="pt-32 pb-20 px-4 md:px-margin-desktop min-h-screen">
      <div className="max-w-3xl mx-auto space-y-14">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[28px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">Centre d'aide</h1>
          <p className="text-on-surface-variant max-w-lg mx-auto text-sm leading-relaxed">
            Tout ce que vous devez savoir sur DocMaster, ses outils PDF et son système d'abonnement.
          </p>
        </div>

        {/* Accès rapide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: 'workspace_premium', label: 'Tarifs', to: '/pricing' },
            { icon: 'dashboard',        label: 'Mon Atelier', to: '/dashboard' },
            { icon: 'gavel',            label: 'Conditions',  to: '/terms' },
            { icon: 'privacy_tip',      label: 'Confidentialité', to: '/privacy' },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-outline-variant bg-surface-container hover:border-primary/40 hover:bg-primary/5 transition-all text-center group">
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant group-hover:text-primary transition-colors"
                style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* FAQ par catégorie */}
        <div className="space-y-12">
          {faqs.map((cat) => (
            <FaqCategorie key={cat.categorie} {...cat} />
          ))}
        </div>

        {/* Contact */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 text-center space-y-3">
          <span className="material-symbols-outlined text-[32px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
          <h3 className="text-base font-bold text-on-surface">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-sm text-on-surface-variant">
            Contactez-nous directement par email, nous répondons sous 24h.
          </p>
          <a href="mailto:contact@docmaster.tech"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-[16px]">send</span>
            contact@docmaster.tech
          </a>
        </div>

      </div>
    </div>
  );
};
