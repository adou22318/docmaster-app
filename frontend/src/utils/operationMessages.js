/**
 * Messages de succès et d'échec pour chaque opération PDF.
 * Source unique utilisée par ResultCard et JobTracker.
 * Clé = type_operation (identifiant backend) ou tool.id
 */
export const OPERATION_MESSAGES = {
  merge: {
    titre:   'Fusion réussie',
    message: 'Votre nouveau document PDF consolidé est prêt.',
  },
  split: {
    titre:   'Découpage réussi',
    message: 'Vos pages ont été extraites avec succès.',
  },
  compress: {
    titre:   'Compression terminée',
    message: 'Votre PDF a été allégé sans perte de qualité visible.',
  },
  protect: {
    titre:   'Protection appliquée',
    message: 'Votre document est désormais chiffré et protégé par mot de passe.',
  },
  unprotect: {
    titre:   'Protection retirée',
    message: 'La protection par mot de passe a été supprimée de votre document.',
  },
  convert_to_pdf: {
    titre:   'Conversion réussie',
    message: 'Votre document Office est maintenant un PDF parfait.',
  },
  pdf_to_txt: {
    titre:   'Extraction de texte terminée',
    message: 'Tout le texte de votre PDF a été récupéré dans un fichier brut.',
  },
  rotate: {
    titre:   'Rotation effectuée',
    message: 'Les pages de votre document ont été réorientées.',
  },
  remove_pages: {
    titre:   'Pages supprimées',
    message: 'Les pages indésirables ont été retirées de votre document.',
  },
  add_blank_pages: {
    titre:   'Pages vierges insérées',
    message: 'Les pages vierges ont été ajoutées à votre document.',
  },
  reorder_pages: {
    titre:   'Pages réorganisées',
    message: 'Votre PDF a été reconstruit dans le nouvel ordre.',
  },
  pdf_to_images: {
    titre:   'Conversion en images terminée',
    message: 'Vos pages PDF ont été exportées en images.',
  },
  extract_images: {
    titre:   "Extraction d'images réussie",
    message: 'Les images contenues dans votre PDF ont été récupérées.',
  },
  watermark: {
    titre:   'Filigrane appliqué',
    message: 'Le filigrane a été intégré à votre document.',
  },
  add_image: {
    titre:   'Image intégrée',
    message: "L'image a été positionnée dans votre PDF.",
  },
  convert_images_to_pdf: {
    titre:   'Conversion en PDF réussie',
    message: 'Vos images ont été transformées en un PDF unique.',
  },
  sign: {
    titre:   'Document signé',
    message: 'Votre signature a été apposée sur le document.',
  },
  clean_metadata: {
    titre:   'Métadonnées supprimées',
    message: 'Les informations cachées de votre PDF ont été effacées.',
  },
};

/**
 * Retourne le message de succès pour une opération.
 * @param {string} operationId - type_operation ou tool.id
 * @returns {{ titre: string, message: string }}
 */
export function getSuccessMessage(operationId) {
  return OPERATION_MESSAGES[operationId] ?? {
    titre:   'Traitement terminé',
    message: 'Votre fichier est prêt.',
  };
}

/**
 * Retourne le titre d'échec pour une opération.
 * @param {string} operationId
 * @returns {string}
 */
export function getEchecTitre(operationId) {
  const op = OPERATION_MESSAGES[operationId];
  if (!op) return 'Traitement échoué';
  // Adapter le titre au contexte d'échec
  return `Échec — ${op.titre.split(' ')[0].toLowerCase() === 'document' ? op.titre : op.titre}`;
}
