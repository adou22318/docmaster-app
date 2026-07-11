// ── Utilitaire : Parser de sélection de pages ───────────────
// Accepte une chaîne flexible pour définir les pages à extraire :
//   - Pages individuelles : "2, 8, 14"
//   - Plages de pages     : "5-10"
//   - Combinaison         : "1-3, 7, 12-15"
//
// Retourne un tableau trié et dédupliqué d'indices 1-indexed.
// Lance une erreur descriptive si la syntaxe est invalide
// ou si les pages sont hors bornes.

/**
 * Parse une chaîne de sélection de pages et retourne les numéros de pages.
 *
 * @param {string} selection - Chaîne de sélection (ex: "1-3, 7, 12-15")
 * @param {number} totalPages - Nombre total de pages du PDF source
 * @returns {number[]} Tableau trié de numéros de pages 1-indexed
 * @throws {Error} Si la syntaxe est invalide ou les pages hors bornes
 */
export function parsePageSelection(selection, totalPages) {

  if (!selection || typeof selection !== 'string') {
    throw new Error('SELECTION_VIDE');
  }

  // Nettoyer les espaces superflus
  const selectionNettoyee = selection.replace(/\s+/g, '');

  if (selectionNettoyee.length === 0) {
    throw new Error('SELECTION_VIDE');
  }

  const pages = new Set();

  // Séparer par virgule pour obtenir chaque segment
  const segments = selectionNettoyee.split(',');

  for (const segment of segments) {

    if (segment.length === 0) {
      // Virgule en double ou en fin de chaîne — ignorer
      continue;
    }

    // Vérifier si c'est une plage (contient un tiret)
    if (segment.includes('-')) {
      const parties = segment.split('-');

      if (parties.length !== 2) {
        throw new Error(`SYNTAXE_INVALIDE:${segment}`);
      }

      const debut = parseInt(parties[0], 10);
      const fin = parseInt(parties[1], 10);

      if (isNaN(debut) || isNaN(fin)) {
        throw new Error(`SYNTAXE_INVALIDE:${segment}`);
      }

      if (debut > fin) {
        throw new Error(`PLAGE_INVERSEE:${segment}`);
      }

      if (debut < 1) {
        throw new Error(`PAGE_HORS_BORNES:${debut}`);
      }

      if (fin > totalPages) {
        throw new Error(`PAGE_HORS_BORNES:${fin},total=${totalPages}`);
      }

      for (let i = debut; i <= fin; i++) {
        pages.add(i);
      }

    } else {
      // Page individuelle
      const page = parseInt(segment, 10);

      if (isNaN(page)) {
        throw new Error(`SYNTAXE_INVALIDE:${segment}`);
      }

      if (page < 1) {
        throw new Error(`PAGE_HORS_BORNES:${page}`);
      }

      if (page > totalPages) {
        throw new Error(`PAGE_HORS_BORNES:${page},total=${totalPages}`);
      }

      pages.add(page);
    }
  }

  if (pages.size === 0) {
    throw new Error('AUCUNE_PAGE_SELECTIONNEE');
  }

  // Trier en ordre croissant
  return [...pages].sort((a, b) => a - b);
}

/**
 * Parse une sélection et la découpe en groupes de pages.
 * Chaque segment séparé par une virgule (page ou plage) devient un groupe.
 *
 * Utilisé en mode 'separate' pour produire un PDF par groupe.
 *
 * @param {string} selection - Chaîne de sélection (ex: "1-3, 7, 12-15")
 * @param {number} totalPages - Nombre total de pages du PDF source
 * @returns {number[][]} Tableau de groupes, chaque groupe est un tableau trié de pages 1-indexed
 * @throws {Error} Si la syntaxe est invalide ou les pages hors bornes
 */
export function parsePageGroups(selection, totalPages) {

  if (!selection || typeof selection !== 'string') {
    throw new Error('SELECTION_VIDE');
  }

  const selectionNettoyee = selection.replace(/\s+/g, '');

  if (selectionNettoyee.length === 0) {
    throw new Error('SELECTION_VIDE');
  }

  const groupes = [];
  const segments = selectionNettoyee.split(',');

  for (const segment of segments) {

    if (segment.length === 0) continue;

    const groupe = [];

    if (segment.includes('-')) {
      const parties = segment.split('-');

      if (parties.length !== 2) {
        throw new Error(`SYNTAXE_INVALIDE:${segment}`);
      }

      const debut = parseInt(parties[0], 10);
      const fin = parseInt(parties[1], 10);

      if (isNaN(debut) || isNaN(fin)) {
        throw new Error(`SYNTAXE_INVALIDE:${segment}`);
      }

      if (debut > fin) {
        throw new Error(`PLAGE_INVERSEE:${segment}`);
      }

      if (debut < 1) {
        throw new Error(`PAGE_HORS_BORNES:${debut}`);
      }

      if (fin > totalPages) {
        throw new Error(`PAGE_HORS_BORNES:${fin},total=${totalPages}`);
      }

      for (let i = debut; i <= fin; i++) {
        groupe.push(i);
      }

    } else {
      const page = parseInt(segment, 10);

      if (isNaN(page)) {
        throw new Error(`SYNTAXE_INVALIDE:${segment}`);
      }

      if (page < 1) {
        throw new Error(`PAGE_HORS_BORNES:${page}`);
      }

      if (page > totalPages) {
        throw new Error(`PAGE_HORS_BORNES:${page},total=${totalPages}`);
      }

      groupe.push(page);
    }

    if (groupe.length > 0) {
      groupes.push(groupe);
    }
  }

  if (groupes.length === 0) {
    throw new Error('AUCUNE_PAGE_SELECTIONNEE');
  }

  return groupes;
}
