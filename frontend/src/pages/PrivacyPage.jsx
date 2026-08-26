import React from 'react';

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-3xl bg-surface-container rounded-3xl p-8 md:p-12 border border-outline-variant shadow-sm">
        <h1 className="font-display-xl text-headline-lg text-primary mb-6">Politique de Confidentialité</h1>
        <div className="space-y-6 text-on-surface-variant text-body-md">
          <p>Dernière mise à jour : 12 Mai 2026</p>
          
          <h2 className="font-label-bold text-lg text-primary mt-8">1. Collecte des Données</h2>
          <p>
            Lors de l'utilisation de PDF DocMaster, nous collectons les informations strictement nécessaires au fonctionnement de l'application :
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Adresse email et nom (lors de l'inscription locale ou via Google).</li>
              <li>Fichiers PDF et images uploadés pour traitement.</li>
            </ul>
          </p>

          <h2 className="font-label-bold text-lg text-primary mt-8">2. Traitement et Rétention des Fichiers</h2>
          <p>
            Conformément à notre cahier des charges de sécurité :
            <strong> Tous vos fichiers (originaux et traités) sont automatiquement et définitivement supprimés de nos serveurs 24 heures après leur création.</strong>
            Aucun document n'est analysé par des tiers ni conservé au-delà de cette durée.
          </p>

          <h2 className="font-label-bold text-lg text-primary mt-8">3. Suppression de Compte</h2>
          <p>
            Vous avez le droit à l'oubli total. Depuis vos Paramètres, vous pouvez demander la suppression définitive de votre compte. Cette action supprime instantanément toutes vos données personnelles ainsi que tous les documents stockés liés à votre compte, sans délai de rétention.
          </p>
        </div>
      </div>
    </div>
  );
};
