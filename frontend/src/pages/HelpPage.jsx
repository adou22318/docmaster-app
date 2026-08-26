import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: "Où sont stockés mes fichiers ?",
    a: "Tous les fichiers sont stockés de manière sécurisée sur notre serveur backend. Conformément à notre politique stricte, ils sont automatiquement supprimés 24h après leur traitement."
  },
  {
    q: "La signature électronique a-t-elle une valeur légale ?",
    a: "DocMaster propose une signature visuelle simple. Elle n'a pas la valeur juridique d'une signature eIDAS certifiée, mais convient parfaitement pour les processus internes ou accords informels."
  },
  {
    q: "Quelle est la taille maximale d'un fichier ?",
    a: "La limite est fixée à 50 Mo par fichier pour garantir de bonnes performances de traitement."
  },
  {
    q: "Est-ce vraiment gratuit ?",
    a: "Oui, cette V1 développée dans le cadre de la soutenance G.I.T est entièrement gratuite et sans limitation artificielle."
  }
];

export const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop min-h-[calc(100vh-100px)]">
      <div className="max-w-3xl mx-auto space-y-16">
        
        <div className="text-center space-y-4">
          <h1 className="font-display-xl text-display-md text-primary">Centre d'aide</h1>
          <p className="text-body-lg text-on-surface-variant">
            Besoin d'aide avec vos documents ? Vous trouverez ici les réponses aux questions les plus fréquentes.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="font-display-xl text-headline-sm text-on-surface mb-6">Questions Fréquentes (FAQ)</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`border border-outline-variant rounded-2xl overflow-hidden transition-all ${openIndex === index ? 'bg-surface-container shadow-sm' : 'bg-surface hover:bg-surface-container-low'}`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between"
                >
                  <span className="font-label-bold text-label-lg text-on-surface">{faq.q}</span>
                  <span className={`material-symbols-outlined text-primary transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 pt-1 border-t border-outline-variant/50">
                    <p className="text-body-md text-on-surface-variant">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-secondary-container/30 border border-secondary/30 rounded-3xl p-8 text-center space-y-6">
          <span className="material-symbols-outlined text-[40px] text-secondary">support_agent</span>
          <h2 className="font-display-xl text-headline-sm text-on-surface">Toujours besoin d'aide ?</h2>
          <p className="text-body-md text-on-surface-variant max-w-lg mx-auto">
            Si vous n'avez pas trouvé la réponse à votre question, n'hésitez pas à contacter le support technique.
          </p>
          <a href="mailto:contact@docmaster.tech" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary font-label-bold rounded-xl hover:bg-secondary/90 transition-all">
            <span className="material-symbols-outlined text-[18px]">mail</span>
            Contacter le support
          </a>
        </section>
      </div>
    </div>
  );
};
