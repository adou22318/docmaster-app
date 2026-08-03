import React from 'react';
import { clsx } from 'clsx';
import { Layers, ArrowRightLeft, PenTool, GripHorizontal, Shield, Zap } from 'lucide-react';

const filters = [
  { id: 'all', label: 'Tous les outils', icon: Layers },
  { id: 'convert', label: 'Conversion', icon: ArrowRightLeft },
  { id: 'edit', label: 'Édition & annotation', icon: PenTool },
  { id: 'organize', label: 'Organisation', icon: GripHorizontal },
  { id: 'security', label: 'Sécurité & signature', icon: Shield },
  { id: 'productivity', label: 'Productivité & lots', icon: Zap },
];

export const ToolFilters = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-10">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = currentFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={clsx(
              "flex items-center px-5 py-2.5 rounded-sm font-bold text-sm transition-colors border",
              isActive 
                ? "bg-main text-base border-main" 
                : "bg-base text-main border-surface hover:border-main"
            )}
          >
            <Icon size={16} className={clsx("mr-2", isActive ? "text-base" : "text-main")} strokeWidth={2} />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};
