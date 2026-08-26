import React from 'react';

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-3xl bg-surface-container rounded-3xl p-8 md:p-12 border border-outline-variant shadow-sm">
        <h1 className="font-display-xl text-headline-lg text-primary mb-6">Conditions d'Utilisation</h1>
        <div className="space-y-6 text-on-surface-variant text-body-md">
          <p>Dernière mise à jour : 12 Mai 2026</p>
          
          <h2 className="font-label-bold text-lg text-primary mt-8">1. Objet du Projet Académique</h2>
          <p>
            PDF DocMaster est un projet développé dans le cadre de la soutenance de Licence G.I.T à l'École Nationale d'Ingénieurs Abderhamane Baba Touré (ENI-ABT) par Abdoulaye Maïga, pour le compte de Mali Développeur. L'application est fournie "telle quelle" à des fins de démonstration et d'usage gratuit.
          </p>

          <h2 className="font-label-bold text-lg text-primary mt-8">2. Avertissement sur la Signature Électronique</h2>
          <p>
            La signature électronique générée par cette plateforme est qualifiée de "simple" et <strong>ne possède aucune valeur légale certifiée</strong> (elle ne répond pas aux normes eIDAS ou équivalentes). Elle sert uniquement à apposer une image ou un texte sur un document pour des usages non officiels.
          </p>

          <h2 className="font-label-bold text-lg text-primary mt-8">3. Limitation de Responsabilité</h2>
          <p>
            En tant que projet académique, PDF DocMaster n'offre aucune garantie de service continu ou de sécurité absolue. L'auteur et l'ENI-ABT déclinent toute responsabilité en cas de perte de données ou de dysfonctionnement. Ne l'utilisez pas pour traiter des documents ultra-confidentiels ou critiques.
          </p>
        </div>
      </div>
    </div>
  );
};
