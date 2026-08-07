import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

/**
 * Composant qui anime une rangée d'outils en cascade.
 * Chaque enfant reçoit un délai de cascade (delay-0 à delay-3).
 */
export const ToolRow = ({ children }) => {
  const { ref, inView } = useScrollAnimation(0.1);

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {React.Children.map(children, (child, index) => (
        <div className={`animate-fade-up delay-${Math.min(index, 3)} ${inView ? 'visible' : ''}`}>
          {child}
        </div>
      ))}
    </div>
  );
};
