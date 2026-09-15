import React from 'react';

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
      <span className="w-1.5 h-5 rounded-full bg-primary flex-shrink-0" />
      {title}
    </h2>
    <div className="text-sm text-on-surface-variant leading-relaxed space-y-2 pl-4">
      {children}
    </div>
  </div>
);

export const PrivacyPage = () => {
  return (
    <div className="pt-32 pb-20 px-4 md:px-margin-desktop min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[28px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}>privacy_tip</span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">Politique de Confidentialité</h1>
          <p className="text-xs text-on-surface-variant">Dernière mise à jour : Septembre 2026</p>
        </div>

        {/* Carte principale */}
        <div className="bg-surface-container border border-outline-variant rounded-3xl p-8 md:p-10 space-y-8">

          <Section title="Collecte des Données">
            <p>
              Lors de l'utilisation de PDF DocMaster, nous collectons uniquement les informations nécessaires au fonctionnement du service :
            </p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                'Adresse email et nom complet (inscription locale ou via Google OAuth)',
                'Fichiers PDF et images importés pour traitement',
                'Données de facturation anonymisées via PayDunya (aucune donnée bancaire stockée chez nous)',
                'Journaux d\'activité anonymes (erreurs, performances)'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5 flex-shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Traitement et Rétention des Fichiers">
            <p>
              Vos fichiers sont traités exclusivement sur nos serveurs sécurisés et <strong className="text-on-surface">supprimés automatiquement 24h</strong> après leur traitement. Nous ne conservons ni ne partageons vos documents avec des tiers.
            </p>
          </Section>

          <Section title="Données de Paiement">
            <p>
              Les paiements sont traités par <strong className="text-on-surface">PayDunya</strong>, une passerelle de paiement certifiée pour l'Afrique de l'Ouest. DocMaster ne stocke jamais vos numéros de mobile money ou informations bancaires. Nous conservons uniquement la confirmation de paiement (montant, date, statut) pour la gestion de votre abonnement.
            </p>
          </Section>

          <Section title="Authentification et Sécurité">
            <p>
              Les mots de passe sont hachés avec bcrypt. Les tokens d'authentification JWT ne sont jamais stockés dans le localStorage du navigateur — ils sont conservés en mémoire uniquement. Un token de rafraîchissement est stocké de manière sécurisée pour maintenir votre session.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              DocMaster n'utilise pas de cookies publicitaires ou de tracking tiers. Seuls des cookies fonctionnels essentiels au maintien de la session peuvent être utilisés.
            </p>
          </Section>

          <Section title="Vos Droits">
            <p>Conformément aux réglementations applicables, vous disposez des droits suivants :</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                'Droit d\'accès à vos données personnelles',
                'Droit de rectification ou de suppression',
                'Droit de supprimer votre compte et toutes les données associées (Paramètres → Supprimer mon compte)',
                'Droit de portabilité de vos données'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5 flex-shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Contact">
            <p>
              Pour toute question relative à vos données personnelles :{' '}
              <a href="mailto:contact@docmaster.tech" className="text-primary hover:underline font-medium">
                contact@docmaster.tech
              </a>
            </p>
          </Section>

        </div>

      </div>
    </div>
  );
};


