import React from 'react';
import { clsx } from 'clsx';
import * as LucideIcons from 'lucide-react';

export const ToolCard = ({ name, desc, iconName, onClick }) => {
  // Récupération dynamique de l'icône depuis lucide-react
  const Icon = LucideIcons[iconName] || LucideIcons.FileText;

  return (
    <div 
      onClick={onClick}
      className={clsx(
        "group bg-base border border-surface p-5 rounded-sm flex items-start space-x-4",
        "cursor-pointer transition-colors hover:border-main"
      )}
    >
      <div className="text-main group-hover:text-accent transition-colors mt-1">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div>
        <h4 className="text-base font-bold text-main mb-1 tracking-tight">{name}</h4>
        <p className="text-sm text-muted leading-snug">{desc}</p>
      </div>
    </div>
  );
};
