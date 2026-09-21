export const tools = [
  {
    id: "pdf_to_images",
    nom: "PDF vers Images",
    description: "Extrayez chaque page de votre PDF en images individuelles.",
    icone: "burst_mode",
    couleur: "default",
    categorie: "conversion",
    typeOperation: "pdf_to_images",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: false,
    route: "/dashboard/tools/pdf_to_images",
    accepteMultiple: false,
    utiliseVisualiseur: true,
    selectionMode: "multiple",
    selectionStyle: "blue",
    howItWorks: {
      etapes: [
        { titre: "Importez votre document PDF", description: "Chargez le fichier dont vous souhaitez extraire les pages sous forme d'images." },
        { titre: "Sélectionnez les pages", description: "Choisissez les pages spécifiques que vous souhaitez convertir en cliquant dessus." },
        { titre: "Téléchargez les images", description: "Récupérez vos pages converties (format ZIP si plusieurs)." }
      ],
      conseil: "Idéal pour utiliser des pages de présentation ou de documents dans des logiciels qui n'acceptent pas le PDF."
    }
  },
  {
    id: "convert_to_pdf",
    nom: "Office vers PDF",
    description: "Convertissez vos documents Word, Excel ou PowerPoint en PDF.",
    icone: "description",
    couleur: "default",
    categorie: "conversion",
    typeOperation: "convert_to_pdf",
    typesAcceptes: {
    mimes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    extensions: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    label: 'Fichiers Office (Word, Excel, PowerPoint)'
  },
    populaire: false,
    route: "/dashboard/tools/convert_to_pdf",
    accepteMultiple: false,
    sansOptions: true,
    howItWorks: {
      etapes: [
        { titre: "Importez votre document Office", description: "Chargez un fichier Word, Excel ou PowerPoint." },
        { titre: "Conversion automatique", description: "Le système convertira automatiquement votre document en préservant sa mise en page." },
        { titre: "Téléchargez le PDF", description: "Votre document converti est prêt à être partagé." }
      ],
      conseil: "La conversion maintient les polices et la mise en page d'origine pour un rendu parfait."
    }
  },
  {
    id: "pdf_to_txt",
    nom: "PDF vers Texte",
    description: "Extrayez le texte brut de vos documents PDF.",
    icone: "text_snippet",
    couleur: "accent",
    categorie: "conversion",
    typeOperation: "pdf_to_txt",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: false,
    route: "/dashboard/tools/pdf_to_txt",
    accepteMultiple: false,
    sansOptions: true,
    howItWorks: {
      etapes: [
        { titre: "Importez votre PDF", description: "Sélectionnez le PDF dont vous souhaitez extraire le texte." },
        { titre: "Extraction automatique", description: "L'outil parcourt le document pour en récupérer tout le texte sélectionnable." },
        { titre: "Téléchargez le texte", description: "Récupérez un fichier .txt brut contenant tout le texte." }
      ],
      conseil: "L'extraction ne fonctionne que sur les PDF textuels (les documents scannés sous forme d'image ne seront pas reconnus)."
    }
  },
  {
    id: "merge",
    nom: "Fusionner des PDF",
    description: "Combinez plusieurs fichiers PDF en un seul document.",
    icone: "merge",
    couleur: "primary",
    categorie: "organisation",
    typeOperation: "merge",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: true,
    route: "/dashboard/tools/merge",
    accepteMultiple: true,
    sansOptions: true,
    howItWorks: {
      etapes: [
        {
          titre: "Importez vos fichiers PDF",
          description: "Glissez-déposez deux fichiers PDF ou plus dans la zone de dépôt."
        },
        {
          titre: "Réorganisez l'ordre",
          description: "Faites glisser les fichiers pour définir l'ordre dans lequel ils seront fusionnés."
        },
        {
          titre: "Téléchargez le résultat",
          description: "Cliquez sur 'Fusionner les PDF' et téléchargez votre document combiné."
        }
      ],
      conseil: "Vous pouvez fusionner jusqu'à 20 fichiers PDF en une seule opération."
    }
  },
  {
    id: "split",
    nom: "Diviser un PDF",
    description: "Séparez un PDF en plusieurs fichiers ou extrayez des pages.",
    icone: "content_cut",
    couleur: "default",
    categorie: "organisation",
    typeOperation: "split",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: true,
    route: "/dashboard/tools/split",
    accepteMultiple: false,
    utiliseVisualiseur: true,
    selectionMode: "range",
    selectionStyle: "blue",
    howItWorks: {
      etapes: [
        {
          titre: "Importez votre PDF",
          description: "Chargez le document que vous souhaitez diviser."
        },
        {
          titre: "Sélectionnez les pages",
          description: "3 modes disponibles : Plage (1er clic = début, 2e clic = fin), Individuel (cliquez sur chaque page), Mixte (simple-clic = page isolée, double-clic = début/fin de plage)."
        },
        {
          titre: "Choisissez le mode de sortie",
          description: "Un seul PDF avec toutes les pages sélectionnées, ou un PDF séparé par groupe de pages (archive ZIP)."
        },
        {
          titre: "Téléchargez le résultat",
          description: "Votre PDF divisé sera prêt en quelques secondes."
        }
      ],
      conseil: "Le mode Mixte combine les avantages des deux autres : sélectionnez librement des pages individuelles et des plages dans la même opération."
    }
  },
  {
    id: "rotate",
    nom: "Rotation de pages",
    description: "Faites pivoter les pages de vos documents PDF.",
    icone: "rotate_right",
    couleur: "default",
    categorie: "organisation",
    typeOperation: "rotate",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: false,
    route: "/dashboard/tools/rotate",
    accepteMultiple: false,
    utiliseVisualiseur: true,
    selectionMode: "multiple",
    selectionStyle: "blue",
    howItWorks: {
      etapes: [
        { titre: "Importez votre PDF", description: "Chargez le document dont vous souhaitez faire pivoter certaines pages." },
        { titre: "Sélectionnez les pages et pivotez", description: "Choisissez les pages à pivoter et définissez l'angle (90°, 180°, ou 270°)." },
        { titre: "Appliquez la rotation", description: "Téléchargez le fichier mis à jour avec les pages réorientées." }
      ],
      conseil: "Utile pour corriger l'orientation de documents numérisés à l'envers."
    }
  },
  {
    id: "remove_pages",
    nom: "Supprimer des pages",
    description: "Retirez des pages spécifiques de votre document PDF.",
    icone: "delete",
    couleur: "default",
    categorie: "organisation",
    typeOperation: "remove_pages",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: false,
    route: "/dashboard/tools/remove_pages",
    accepteMultiple: false,
    utiliseVisualiseur: true,
    selectionMode: "multiple",
    selectionStyle: "red",
    howItWorks: {
      etapes: [
        { titre: "Importez votre PDF", description: "Chargez le document dont vous souhaitez supprimer des pages." },
        { titre: "Sélectionnez les pages à retirer", description: "Cliquez sur les pages indésirables, elles seront marquées en rouge." },
        { titre: "Confirmez la suppression", description: "Le document final sera généré sans les pages sélectionnées." }
      ],
      conseil: "Les numéros de pages seront automatiquement réajustés sur le document final."
    }
  },
  {
    id: "add_blank_pages",
    nom: "Ajouter des pages vierges",
    description: "Insérez des pages blanches n'importe où dans votre PDF.",
    icone: "post_add",
    couleur: "default",
    categorie: "organisation",
    typeOperation: "add_blank_pages",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: false,
    route: "/dashboard/tools/add_blank_pages",
    accepteMultiple: false,
    utiliseMiniatures: true,
    selectionMode: 'none',
    howItWorks: {
      etapes: [
        { titre: "Importez votre PDF", description: "Chargez le document nécessitant l'ajout de pages vierges." },
        { titre: "Définissez la position", description: "Choisissez d'insérer les pages au début, à la fin ou après une page spécifique." },
        { titre: "Indiquez la quantité", description: "Précisez le nombre de pages blanches à insérer." },
        { titre: "Validez", description: "Téléchargez votre document mis à jour." }
      ],
      conseil: "Pratique pour préparer des documents destinés à une impression recto verso avec pages de séparation."
    }
  },
  {
    id: "watermark",
    nom: "Ajouter un filigrane",
    description: "Apposez un texte en filigrane sur les pages de votre PDF.",
    icone: "branding_watermark",
    couleur: "default",
    categorie: "edition",
    typeOperation: "watermark",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: false,
    route: "/dashboard/tools/watermark",
    accepteMultiple: false,
    utiliseVisualiseur: true,
    selectionMode: "multiple",
    selectionStyle: "blue",
    howItWorks: {
      etapes: [
        { titre: "Importez votre PDF", description: "Chargez le document à protéger." },
        { titre: "Configurez le filigrane", description: "Définissez le texte, sa couleur, taille, opacité et rotation." },
        { titre: "Sélectionnez l'emplacement", description: "Choisissez la position du filigrane et les pages concernées." },
        { titre: "Appliquez le filigrane", description: "Téléchargez le document avec le filigrane intégré." }
      ],
      conseil: "Un filigrane semi-transparent et placé au centre ou en diagonale offre la meilleure protection sans nuire à la lecture."
    }
  },
  {
    id: "add_image",
    nom: "Ajouter une image",
    description: "Incrustez une image sur les pages de votre PDF existant.",
    icone: "add_photo_alternate",
    couleur: "default",
    categorie: "edition",
    typeOperation: "add_image",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: false,
    route: "/dashboard/tools/add_image",
    accepteMultiple: false,
    utiliseVisualiseurImage: true,
    howItWorks: {
      etapes: [
        {
          titre: "Importez votre PDF",
          description: "Chargez le document PDF sur lequel vous souhaitez incruster une image."
        },
        {
          titre: "Importez votre image",
          description: "Dans le panneau de droite, sélectionnez l'image PNG ou JPG à incruster (logo, tampon, illustration). PNG recommandé pour la transparence."
        },
        {
          titre: "Positionnez l'image sur la page",
          description: "L'image apparaît directement sur la page PDF. Glissez-la là où vous le souhaitez et ajustez sa taille via la poignée bleue."
        },
        {
          titre: "Validez la position (si besoin)",
          description: "Pour un positionnement différent selon les pages, cliquez \u00ab\u202fValider la position\u202f\u00bb sur chaque page visitée. Les autres pages recevront l'image centrée."
        },
        {
          titre: "Choisissez les pages cibles et lancez",
          description: "Sélectionnez la page courante, tout le document ou des pages spécifiques, puis cliquez sur \u00ab\u202fIncruster l'image\u202f\u00bb."
        }
      ],
      conseil: "Pour que l'image ne masque pas le contenu existant, utilisez un PNG avec fond transparent. Naviguez de page en page et validez la position pour un placement personnalisé sur chaque page."
    }
  },
  {
    id: "extract_images",
    nom: "Extraire des images",
    description: "Récupérez toutes les images contenues dans votre PDF.",
    icone: "imagesmode",
    couleur: "default",
    categorie: "edition",
    typeOperation: "extract_images",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: true,
    route: "/dashboard/tools/extract_images",
    accepteMultiple: false,
    utiliseVisualiseur: true,
    selectionMode: "multiple",
    selectionStyle: "blue",
    howItWorks: {
      etapes: [
        {
          titre: "Importez votre PDF",
          description: "Sélectionnez le fichier dont vous souhaitez récupérer les images embarquées."
        },
        {
          titre: "Définissez le périmètre",
          description: "Extrayez les images de tout le document ou cliquez sur les pages dans le visualiseur pour limiter l'extraction à certaines pages uniquement."
        },
        {
          titre: "Personnalisez les dimensions (optionnel)",
          description: "Par défaut, les images sont extraites à leur taille originale. Vous pouvez saisir des dimensions cibles en pixels ou utiliser un préréglage (HD, Full HD, 4K, A4)."
        },
        {
          titre: "Choisissez le format de sortie (optionnel)",
          description: "Conservez le format d'origine de chaque image, ou convertissez-les toutes en PNG (sans perte) ou JPG (compact)."
        },
        {
          titre: "Téléchargez les images",
          description: "Si une seule image est trouvée, elle est téléchargée directement. Si plusieurs images sont extraites, un fichier ZIP regroupant toutes les images est généré automatiquement."
        }
      ],
      conseil: "Seules les images embarquées nativement dans le PDF sont extraites. Les graphiques vectoriels (SVG), textes stylés et éléments de mise en page ne seront pas inclus. Les images inférieures à 10 px sont ignorées (spacers, masques)."
    }
  },
  {
    id: "sign",
    nom: "Signer un PDF",
    description: "Apposez une signature électronique simple sur votre document PDF.",
    icone: "history_edu",
    couleur: "primary",
    categorie: "edition",
    typeOperation: "sign",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: true,
    route: "/dashboard/tools/sign",
    accepteMultiple: false,
    utiliseVisualiseurSignature: true,
    howItWorks: {
      etapes: [
        {
          titre: "Créez votre signature",
          description: "Dessinez votre signature avec la souris ou votre doigt, saisissez votre nom en style calligraphique, ou importez une image PNG."
        },
        {
          titre: "Positionnez la signature",
          description: "Faites glisser votre signature à l'endroit souhaité sur la page du document. Utilisez les poignées pour la redimensionner."
        },
        {
          titre: "Téléchargez le document signé",
          description: "Votre PDF avec la signature apposée sera disponible immédiatement."
        }
      ],
      conseil: "Pour une signature sans fond blanc, utilisez l'onglet 'Dessiner' ou importez une image PNG avec fond transparent."
    }
  },
  {
    id: "protect",
    nom: "Protéger par mot de passe",
    description: "Sécurisez l'ouverture de votre PDF avec un mot de passe.",
    icone: "lock",
    couleur: "default",
    categorie: "securite",
    typeOperation: "protect",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: true,
    route: "/dashboard/tools/protect",
    accepteMultiple: false,
    howItWorks: {
      etapes: [
        { titre: "Importez votre PDF", description: "Sélectionnez le document que vous souhaitez verrouiller." },
        { titre: "Définissez un mot de passe", description: "Saisissez un mot de passe robuste qui sera requis pour ouvrir le fichier." },
        { titre: "Téléchargez le PDF protégé", description: "Votre fichier chiffré est prêt et sécurisé." }
      ],
      conseil: "Utilisez un mot de passe contenant des lettres, des chiffres et des caractères spéciaux pour une sécurité maximale."
    }
  },
  {
    id: "unprotect",
    nom: "Supprimer la protection",
    description: "Retirez le mot de passe de protection d'un document PDF.",
    icone: "lock_open",
    couleur: "default",
    categorie: "securite",
    typeOperation: "unprotect",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: false,
    route: "/dashboard/tools/unprotect",
    accepteMultiple: false,
    howItWorks: {
      etapes: [
        { titre: "Importez le PDF protégé", description: "Sélectionnez le document chiffré." },
        { titre: "Saisissez le mot de passe actuel", description: "Vous devez connaître le mot de passe actuel pour pouvoir le retirer." },
        { titre: "Téléchargez le PDF déverrouillé", description: "Votre document est de nouveau librement accessible." }
      ],
      conseil: "Idéal pour retirer la protection d'un document que vous consultez fréquemment et dont vous êtes le propriétaire."
    }
  },
  {
    id: "compress",
    nom: "Compresser un PDF",
    description: "Réduisez la taille de votre document pour un partage facilité.",
    icone: "compress",
    couleur: "default",
    categorie: "securite",
    typeOperation: "compress",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: true,
    route: "/dashboard/tools/compress",
    accepteMultiple: false,
    howItWorks: {
      etapes: [
        {
          titre: "Importez votre PDF",
          description: "Sélectionnez le fichier PDF que vous souhaitez réduire."
        },
        {
          titre: "Choisissez le niveau de compression",
          description: "Haute : fichier très léger mais qualité réduite. Moyenne : bon équilibre. Basse : qualité maximale, réduction légère."
        },
        {
          titre: "Téléchargez votre PDF allégé",
          description: "Le pourcentage de réduction sera affiché une fois le traitement terminé."
        }
      ],
      conseil: "Pour les PDF contenant beaucoup d'images, la compression Haute peut réduire la taille de plus de 70%."
    }
  },
  {
    id: "convert_images_to_pdf",
    nom: "Images vers PDF",
    description: "Assemblez plusieurs images (JPG, PNG, TIFF) en un seul document PDF.",
    icone: "photo_library",
    couleur: "default",
    categorie: "conversion",
    typeOperation: "convert_images_to_pdf",
    typesAcceptes: {
    mimes: ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/tiff'],
    extensions: ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff'],
    label: 'Images (JPG, PNG, BMP, GIF, TIFF)'
  },
    populaire: false,
    route: "/dashboard/tools/convert_images_to_pdf",
    accepteMultiple: true,
    howItWorks: {
      etapes: [
        { titre: "Importez vos images", description: "Ajoutez vos fichiers JPG, PNG ou TIFF. Vous pouvez en importer jusqu'à 20 en une fois, par glisser-déposer ou via le sélecteur de fichiers." },
        { titre: "Réorganisez l'ordre", description: "Faites glisser les lignes de la liste (icône ⠿) pour définir l'ordre d'apparition de chaque image dans le PDF final. Cliquez sur × pour retirer une image." },
        { titre: "Choisissez la mise en page", description: "Sélectionnez le format (A4 ou US Letter), l'orientation (auto, portrait ou paysage) et les marges dans le panneau de configuration." },
        { titre: "Téléchargez le PDF", description: "Cliquez sur « Créer le PDF » — toutes vos images seront assemblées en un seul document, chaque image occupant une page." }
      ],
      conseil: "L'orientation « Auto » adapte automatiquement chaque page à l'image : paysage pour une photo horizontale, portrait pour une verticale."
    }
  },
  {
    id: "clean_metadata",
    nom: "Nettoyer (Métadonnées)",
    description: "Supprimez toutes les métadonnées de votre document PDF.",
    icone: "cleaning_services",
    couleur: "default",
    categorie: "securite",
    typeOperation: "clean_metadata",
    typesAcceptes: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF uniquement'
  },
    populaire: false,
    route: "/dashboard/tools/clean_metadata",
    accepteMultiple: false,
    sansOptions: true,
    howItWorks: {
      etapes: [
        { titre: "Importez le PDF", description: "Sélectionnez le document à nettoyer." },
        { titre: "Nettoyage automatique", description: "L'outil supprime l'auteur, la date de création, etc." },
        { titre: "Téléchargez le PDF", description: "Votre document est maintenant anonymisé." }
      ],
      conseil: "Idéal avant d'envoyer un document sensible à un tiers."
    }
  }
];
