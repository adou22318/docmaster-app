import { useInView } from 'react-intersection-observer';

/**
 * Hook réutilisable pour les animations d'entrée au scroll.
 * @param {number} threshold - Pourcentage de visibilité avant déclenchement (0.1 = 10%)
 * @param {boolean} triggerOnce - Si true, l'animation ne se rejoue pas au re-scroll
 */
export function useScrollAnimation(threshold = 0.15, triggerOnce = true) {
  const { ref, inView } = useInView({ threshold, triggerOnce });
  return { ref, inView };
}
