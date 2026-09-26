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

export const TermsPage = () => {
  return (
    <div className="pt-32 pb-20 px-4 md:px-margin-desktop min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[28px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">Conditions d'Utilisation</h1>
          <p className="text-xs text-on-surface-variant">Dernière mise à jour : Septembre 2026</p>
        </div>

        {/* Carte principale */}
        <div className="bg-surface-container border border-outline-variant rounded-3xl p-8 md:p-10 space-y-8">

          <Section title="Objet du Projet">
            <p>
              PDF DocMaster est une application développée dans le cadre de la soutenance de Licence Professionnelle G.I.T à l'École Nationale d'Ingénieurs Abderhamane Baba Touré (ENI-ABT) par Abdoulaye Maïga. Elle est déployée comme SaaS freemium à des fins de démonstration académique et d'usage réel.
            </p>
          </Section>

          <Section title="Plans et Abonnements">
            <p>DocMaster propose deux plans :</p>
            <ul className="list-none space-y-2 mt-2">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant mt-0.5 flex-shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span><strong className="text-on-surface">Plan Gratuit</strong> — accès à tous les outils de base avec 7 jours d'essai et 500 Mo de stockage.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-primary mt-0.5 flex-shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <span><strong className="text-on-surface">Plan Pro — 5 000 XOF/mois</strong> — accès complet incluant les outils avancés (extraction d'images), 5 Go de stockage, traitements prioritaires et support.</span>
              </li>
            </ul>
            <p className="mt-3">
              Le paiement est effectué via PayDunya. L'abonnement est renouvelé mensuellement et peut être annulé à tout moment depuis les paramètres du compte.
            </p>
          </Section>

          <Section title="Signature Électronique">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3">
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-600 flex-shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span>
                  La signature électronique générée par DocMaster est qualifiée de <strong>« simple »</strong> et{' '}
                  <strong>ne possède aucune valeur légale certifiée</strong> (elle ne répond pas aux normes eIDAS ou équivalentes). Elle sert uniquement à apposer une image, un dessin ou un texte sur un document pour des usages non officiels.
                </span>
              </p>
            </div>
          </Section>

          <Section title="Responsabilité">
            <p>
              L'utilisateur est seul responsable de l'usage qu'il fait des documents traités via DocMaster. La plateforme ne peut être tenue responsable d'une utilisation frauduleuse ou contraire aux lois en vigueur. Les fichiers restent stockés jusqu'à suppression manuelle par l'utilisateur — DocMaster n'y accède à aucun moment.
            </p>
          </Section>

          <Section title="Propriété Intellectuelle">
            <p>
              DocMaster et ses composants sont la propriété d'Abdoulaye Maïga. Le code source est protégé dans le cadre de la Licence Professionnelle G.I.T — ENI-ABT. Toute reproduction ou distribution sans autorisation écrite est interdite.
            </p>
          </Section>

          <Section title="Modifications">
            <p>
              Ces conditions peuvent être mises à jour à tout moment. Les utilisateurs seront notifiés par email en cas de modification substantielle. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles conditions.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Pour toute question relative aux présentes conditions :{' '}
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
