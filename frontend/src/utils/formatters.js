export const formatSize = (bytes) => {
  const numBytes = Number(bytes);
  if (isNaN(numBytes) || numBytes <= 0) return '0 Octets';
  const k = 1024;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  if (i < 0) return '0 Octets';
  if (i >= sizes.length) return 'Taille trop grande';
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const traduireSelection = (pages) => {
  if (!pages || pages.length === 0) return '';
  if (pages.length === 1) return `${pages[0]}`;

  const pagesTriees = [...pages].sort((a, b) => a - b);
  const groupes = [];
  let debutGroupe = pagesTriees[0];
  let precedent = pagesTriees[0];

  for (let i = 1; i < pagesTriees.length; i++) {
    if (pagesTriees[i] === precedent + 1) {
      precedent = pagesTriees[i];
    } else {
      groupes.push(
        debutGroupe === precedent ? `${debutGroupe}` : `${debutGroupe}-${precedent}`
      );
      debutGroupe = pagesTriees[i];
      precedent = pagesTriees[i];
    }
  }
  // Dernier groupe
  groupes.push(
    debutGroupe === precedent ? `${debutGroupe}` : `${debutGroupe}-${precedent}`
  );

  return groupes.join(', ');
};
