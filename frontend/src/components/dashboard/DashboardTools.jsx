import React from 'react';
import { Link } from 'react-router-dom';

export const DashboardTools = () => {
  const tools = [
    {
      name: 'Image → PDF',
      desc: 'Convertir des photos de chantier ou scans en PDF haute résolution.',
      icon: 'image',
      to: '/dashboard/tools/convert',
      variant: 'default',
    },
    {
      name: 'Fusionner / Organiser',
      desc: 'Assembler, réorganiser ou extraire des pages de vos documents.',
      icon: 'merge',
      to: '/dashboard/tools/split-merge',
      variant: 'primary',
    },
    {
      name: 'Signer PDF',
      desc: 'Apposer un cachet technique ou une signature manuscrite/typographique.',
      icon: 'history_edu',
      to: '/dashboard/tools/sign',
      variant: 'default',
    },
    {
      name: 'Diviser PDF',
      desc: 'Extraire des pages ou séparer un DCE par corps d\'état.',
      icon: 'content_cut',
      to: '/dashboard/tools/split-merge',
      variant: 'default',
    },
    {
      name: 'Protéger',
      desc: 'Chiffrer et restreindre l\'accès aux documents confidentiels.',
      icon: 'lock',
      to: '/dashboard/tools/security',
      variant: 'default',
    },
    {
      name: 'Compresser',
      desc: 'Réduire le poids des fichiers pour l\'envoi par email.',
      icon: 'compress',
      to: '/dashboard/tools/compress',
      variant: 'default',
    },
    {
      name: 'Filigrane',
      desc: 'Ajouter une marque de propriété ou un statut "Confidentiel".',
      icon: 'brush',
      to: '/dashboard/tools/watermark',
      variant: 'default',
    },
    {
      name: 'PDF → Texte',
      desc: 'Extraire le texte brut de vos documents PDF.',
      icon: 'text_snippet',
      to: '/dashboard/tools/convert',
      variant: 'accent',
    },
  ];

  return (
    <section className="space-y-8">
      <div className="border-b border-outline-variant flex gap-8 overflow-x-auto custom-scrollbar">
        <button className="pb-4 px-2 font-label-bold text-label-sm border-b-2 border-secondary text-primary whitespace-nowrap">Tous les outils</button>
        <Link className="pb-4 px-2 font-label-bold text-label-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" to="/dashboard/tools/convert">Conversion</Link>
        <Link className="pb-4 px-2 font-label-bold text-label-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" to="/dashboard/tools/split-merge">Manipulation de pages</Link>
        <Link className="pb-4 px-2 font-label-bold text-label-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" to="/dashboard/tools/compress">Compression &amp; Protection</Link>
        <Link className="pb-4 px-2 font-label-bold text-label-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" to="/dashboard/tools/sign">Signature électronique</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => {
          const isPrimary = tool.variant === 'primary';
          const isAccent = tool.variant === 'accent';

          return (
            <Link 
              key={index}
              className={`rounded-2xl p-8 flex gap-6 hover:shadow-md transition-all cursor-pointer group ${
                isPrimary 
                  ? 'bg-primary text-on-primary hover:shadow-lg' 
                  : isAccent
                    ? 'bg-surface-container-lowest border border-secondary-fixed-dim'
                    : 'bg-surface-container-lowest border border-outline-variant'
              }`}
              to={tool.to}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                isPrimary ? 'bg-on-primary-fixed-variant/20' : 'bg-secondary-container'
              }`}>
                <span className={`material-symbols-outlined ${isPrimary ? 'text-on-primary' : 'text-on-secondary-container'}`}>{tool.icon}</span>
              </div>
              <div>
                <h4 className="font-headline-md text-body-lg mb-1">{tool.name}</h4>
                <p className={`text-label-sm ${isPrimary ? 'opacity-70' : 'text-on-surface-variant'}`}>{tool.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
