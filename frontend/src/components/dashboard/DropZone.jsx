import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../services/api/axiosClient';
import { useFileStore } from '../../store/useFileStore';
import { useToast } from '../../context/ToastContext';
import { ErrorBanner } from '../layout/ErrorBanner';
import { FileFormatError } from '../workspace/FileFormatError';
import { tools } from '../../data/tools';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { formatSize } from '../../utils/formatters';
import { detecterProtectionPdf } from '../../hooks/usePdfPasswordDetection';
import { ModalePdfProtege } from '../workspace/ModalePdfProtege';
import { useNavigate, useLocation } from 'react-router-dom';

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.xlsx', '.pptx', '.tiff', '.tif'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo

export const DropZone = ({ toolId, onPdfNonProtege }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [modalePdfProtege, setModalePdfProtege] = useState(false);
  const [fichierEnAttente, setFichierEnAttente] = useState(null);
  // Erreur de format spÃ©cifique Ã  la validation locale (avant upload)
  const [formatError, setFormatError] = useState(null);
  const fileInputRef = useRef(null);
  const { ref: scrollRef, inView } = useScrollAnimation(0.1);
  const navigate = useNavigate();
  const location = useLocation();

  // Traiter un fichier prÃ©chargÃ© (ex: depuis la modale PDF protÃ©gÃ©)
  React.useEffect(() => {
    if (location.state?.preloadedFile) {
      processFile(location.state.preloadedFile);
      // Nettoyer l'Ã©tat pour ne pas re-traiter au retour
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.preloadedFile]);
  
  const { 
    currentFile, 
    uploadProgress, 
    uploadStatus, 
    uploadError,
    startUpload,
    setUploadProgress,
    uploadSuccess,
    setUploadError,
    cancelCurrentFile
  } = useFileStore();

  const toast = useToast();

  const handleCancelImport = async () => {
    setIsCancelling(true);
    const nomFichier = currentFile?.nomOriginal || 'le fichier';
    try {
      const result = await cancelCurrentFile();
      if (result.success) {
        setShowCancelConfirm(false);
        toast.info(`Import de Â«Â ${nomFichier}Â Â» annulÃ©.`);
      } else {
        // Erreur serveur mais on vide quand mÃªme l'UI pour ne pas bloquer l'utilisateur
        toast.error(result.error || "L'annulation a Ã©chouÃ© cÃ´tÃ© serveur, mais le fichier a Ã©tÃ© retirÃ© localement.");
        setShowCancelConfirm(false);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (uploadStatus === 'idle' || uploadStatus === 'error') {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const currentTool = tools.find(t => t.id === toolId);

  const validateFile = (file) => {
    if (!file) return false;

    // L'extension est le critre principal car file.type peut tre vide sur Windows
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (currentTool && currentTool.typesAcceptes) {
      const { extensions, label } = currentTool.typesAcceptes;
      if (!extensions.includes(fileExt)) {
        // Message contextuel selon le type d'outil
        let message;
        if (currentTool.id === 'convert_to_pdf') {
          message = `Le fichier "${file.name}" ne peut pas Ãªtre converti ici.\n\nSeuls les formats Office sont acceptÃ©s : Word (.docx), Excel (.xlsx) et PowerPoint (.pptx).`;
        } else if (currentTool.id === 'convert_images_to_pdf') {
          message = `Le fichier "${file.name}" n'est pas une image.\n\nFormats acceptÃ©s : JPG, PNG, BMP, GIF, TIFF.`;
        } else {
          // Tous les autres outils attendent un PDF
          message = `Le fichier "${file.name}" n'est pas acceptÃ© par cet outil.\n\nFormat requis : PDF uniquement.\n\nSi votre document est au format Word, Excel ou PowerPoint, convertissez-le d'abord en PDF.`;
        }
        // Erreur de FORMAT : utiliser le state local dÃ©diÃ© (affichÃ© via FileFormatError)
        setFormatError(message);
        return false;
      }
    } else {
      // Outil sans typesAcceptes dÃ©fini : validation sur la liste globale
      if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
        setFormatError(`Le fichier "${file.name}" n'est pas dans un format supportÃ©.\n\nFormats acceptÃ©s : PDF, JPG, PNG, DOCX, XLSX, PPTX, TIFF.`);
        return false;
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Fichier trop volumineux. La taille maximale autorise est de 50 Mo.');
      return false;
    }

    return true;
  };

  const processFile = async (file, motDePasse = null) => {
    // RÃ©initialiser les erreurs prÃ©cÃ©dentes
    setFormatError(null);
    if (!validateFile(file)) return;

    if (file.type === 'application/pdf' && !motDePasse) {
      const { estProtege } = await detecterProtectionPdf(file);
      
      if (toolId === 'unprotect') {
        if (!estProtege) {
          if (onPdfNonProtege) {
            onPdfNonProtege(file);
          } else {
            setUploadError("Ce PDF n'est pas protÃ©gÃ©. Aucun dÃ©verrouillage n'est nÃ©cessaire.");
          }
          return;
        }
      } else {
        if (estProtege) {
          setFichierEnAttente(file);
          setModalePdfProtege(true);
          return;
        }
      }
    }

    setModalePdfProtege(false);
    startUpload();
    
    const formData = new FormData();
    formData.append('file', file);

    // Construire l'URL avec toolId en query param â€” le fileFilter de Multer
    // lit req.query.tool car req.body n'est pas dispo au moment du fileFilter
    const uploadUrl = toolId ? `/files/upload?tool=${encodeURIComponent(toolId)}` : '/files/upload';

    try {
      const response = await axiosClient.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        const fileData = response.data.data;
        // Backend RETURNING id_files (pas "id") â€” voir createFileService
        const resolvedId =
          fileData?.file?.id_files ||
          fileData?.file?.id ||
          fileData?.id_files ||
          fileData?.id;

        if (!resolvedId) {
          setUploadError("Upload rÃ©ussi mais identifiant fichier manquant. RÃ©essayez.");
          return;
        }

        uploadSuccess({
          fileId: resolvedId,
          nomOriginal: fileData.file?.nom_original || fileData.nom_original || file.name,
          tailleOctets: fileData.file?.taille_octets || fileData.taille_octets || file.size,
          motDePassePdf: motDePasse
        });
      }
    } catch (error) {
      const serverMsg = error.response?.data?.message;
      if (serverMsg) {
        setUploadError(serverMsg);
      } else {
        setUploadError("Erreur rÃ©seau lors de l'upload. VÃ©rifiez votre connexion et rÃ©essayez.");
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploadStatus !== 'idle' && uploadStatus !== 'error') return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (uploadStatus === 'idle' || uploadStatus === 'error') {
      fileInputRef.current?.click();
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };



  // DÃ©termine les outils compatibles avec le type de fichier uploadÃ©
  const getSuggestedTools = () => {
    if (!currentFile) return tools.filter(t => t.populaire).slice(0, 4);
    
    const ext = currentFile.nomOriginal.split('.').pop().toLowerCase();
    
    if (ext === 'pdf') {
      // Tous les outils PDF sauf conversion vers PDF
      return tools.filter(t => !['convert_images_to_pdf', 'convert_to_pdf'].includes(t.id)).slice(0, 6);
    }
    if (['jpg', 'jpeg', 'png', 'tiff', 'tif'].includes(ext)) {
      return tools.filter(t => t.id === 'convert_images_to_pdf');
    }
    if (['docx', 'xlsx', 'pptx'].includes(ext)) {
      return tools.filter(t => t.id === 'convert_to_pdf');
    }
    return tools.filter(t => t.populaire).slice(0, 4);
  };

  return (
    <section ref={scrollRef} className={`relative group animate-fade-up ${inView ? 'visible' : ''}`}>
      {/* Erreur de FORMAT : banniÃ¨re inline identique au PDF protÃ©gÃ© */}
      {formatError && uploadStatus !== 'uploading' && uploadStatus !== 'done' && (
        <div className="mb-4">
          <FileFormatError
            message={formatError}
            onChangeFile={() => setFormatError(null)}
            showConvert={toolId !== 'convert_to_pdf' && toolId !== 'convert_images_to_pdf'}
          />
        </div>
      )}

      {/* Erreurs non-format (rÃ©seau, taille, etc.) */}
      {uploadError && uploadStatus === 'error' && uploadError !== "Ce PDF n'est pas protÃ©gÃ©. Aucun dÃ©verrouillage n'est nÃ©cessaire." && (
        <ErrorBanner 
          message={uploadError} 
          onDismiss={() => setUploadError(null)} 
        />
      )}

      <div className="absolute -inset-2 bg-gradient-to-r from-secondary-container/20 to-tertiary-fixed/20 blur-xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div 
        className={`relative bg-surface border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-500 shadow-sm ${
          uploadStatus === 'done' ? 'p-10 min-h-[300px]' : 'p-16 min-h-[400px]'
        } ${
          uploadStatus === 'idle' || uploadStatus === 'error' ? 'cursor-pointer hover:border-secondary' : ''
        } ${isDragging ? 'border-secondary bg-secondary-container/5 highlight-zone' : 'border-outline-variant'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="absolute inset-0 dropzone-pattern opacity-5 pointer-events-none"></div>
        
        {/* Ã‰TAT IDLE */}
        {uploadStatus === 'idle' && (
          <div className="z-10 flex flex-col items-center pointer-events-none">
            <div className="mb-8 p-6 bg-secondary-container/10 rounded-full text-secondary scale-125 transition-transform group-hover:scale-150 duration-700">
              <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'wght' 200" }}>cloud_upload</span>
            </div>
            <h3 className="font-display-xl text-headline-md text-primary mb-4">Glissez vos plans et dossiers techniques</h3>
            <p className="text-body-md text-on-surface-variant max-w-md mb-8">
              {currentTool?.typesAcceptes ? `Formats acceptÃ©s : ${currentTool.typesAcceptes.label}.` : "Format PDF, JPG, PNG, DOCX, XLSX, PPTX, TIFF."} Jusqu'Ã  50 Mo par fichier.
            </p>
            <div className="flex gap-4 pointer-events-auto">
              <button 
                className="px-8 py-4 bg-primary text-on-primary font-label-bold rounded-lg hover:bg-secondary hover:text-primary transition-all shadow-lg active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Parcourir mes fichiers
              </button>
            </div>
          </div>
        )}

        {/* Ã‰TAT ERROR */}
        {uploadStatus === 'error' && (
          <div className="z-10 flex flex-col items-center pointer-events-none">
            <div className="mb-8 p-6 bg-secondary-container/10 rounded-full text-secondary scale-125 transition-transform group-hover:scale-150 duration-700">
              <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'wght' 200" }}>cloud_upload</span>
            </div>
            <h3 className="font-display-xl text-headline-md text-primary mb-4">Glissez vos plans et dossiers techniques</h3>
            <p className="text-body-md text-on-surface-variant max-w-md mb-8">
              {currentTool?.typesAcceptes ? `Formats acceptÃ©s : ${currentTool.typesAcceptes.label}.` : "Format PDF, JPG, PNG, DOCX, XLSX, PPTX, TIFF."} Jusqu'Ã  50 Mo par fichier.
            </p>
            <div className="flex gap-4 pointer-events-auto">
              <button 
                className="px-8 py-4 bg-primary text-on-primary font-label-bold rounded-lg hover:bg-secondary hover:text-primary transition-all shadow-lg active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                RÃ©essayer l'import
              </button>
              <button 
                className="px-8 py-4 border-2 border-outline text-primary font-label-bold rounded-lg hover:border-secondary hover:text-secondary transition-all active:scale-95 disabled:opacity-50"
                disabled={isCancelling}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelImport();
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Ã‰TAT UPLOADING */}
        {uploadStatus === 'uploading' && (
          <div className="z-10 flex flex-col items-center w-full max-w-md">
            <div className="mb-6 p-4 bg-secondary-container/20 rounded-full text-secondary animate-pulse">
              <span className="material-symbols-outlined text-4xl animate-bounce">upload</span>
            </div>
            <h3 className="font-headline-md text-title-lg text-primary mb-2">TÃ©lÃ©chargement en cours...</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">{uploadProgress}% complÃ©tÃ©</p>
            <div className="w-full bg-surface-container-high rounded-full h-2 mb-2 overflow-hidden">
              <div 
                className="bg-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Ã‰TAT DONE â€” AperÃ§u + Choix d'outil */}
        {uploadStatus === 'done' && currentFile && (
          <div className="z-10 flex flex-col items-center w-full max-w-3xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            {/* AperÃ§u du fichier */}
            <div className="flex items-center gap-4 bg-surface-container-low rounded-xl p-4 w-full mb-6 border border-outline-variant">
              <div className="p-3 bg-green-500/15 text-green-600 dark:text-green-400 rounded-lg shrink-0">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="text-left flex-grow min-w-0">
                <h4 className="font-label-bold text-body-md text-primary truncate">{currentFile.nomOriginal}</h4>
                <p className="text-label-sm text-on-surface-variant">{formatSize(currentFile.tailleOctets)}</p>
              </div>
              <button 
                className="px-4 py-2 text-label-sm font-label-bold text-error hover:bg-error-container rounded-lg transition-colors shrink-0"
                onClick={() => setShowCancelConfirm(true)}
              >
                Annuler
              </button>
            </div>

            {/* Choix de l'outil */}
            <h3 className="font-headline-md text-title-md text-primary mb-4">Que souhaitez-vous faire ?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
              {getSuggestedTools().map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.route}
                  className="flex items-center gap-3 p-4 bg-surface border border-outline-variant rounded-xl hover:border-secondary hover:-translate-y-0.5 transition-all group/tool"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-xl">{tool.icone}</span>
                  </div>
                  <span className="font-label-bold text-label-sm text-primary group-hover/tool:text-secondary transition-colors">{tool.nom}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Floating visual accents (only in idle) */}
        {uploadStatus === 'idle' && (
          <>
            <div className="absolute top-10 left-10 opacity-20 group-hover:translate-x-4 transition-transform duration-1000 pointer-events-none">
              <span className="material-symbols-outlined text-4xl">picture_as_pdf</span>
            </div>
            <div className="absolute bottom-10 right-10 opacity-20 group-hover:-translate-x-4 transition-transform duration-1000 pointer-events-none">
              <span className="material-symbols-outlined text-4xl">inventory_2</span>
            </div>
          </>
        )}

        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          className="hidden"
          accept={currentTool?.typesAcceptes ? currentTool.typesAcceptes.extensions.join(',') : ".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.pptx,.tiff,.tif"}
        />
      </div>

      {/* MODALE POUR PDF PROTÃ‰GÃ‰ */}
      {modalePdfProtege && (
        <ModalePdfProtege
          fichier={fichierEnAttente}
          onAnnuler={() => {
            setModalePdfProtege(false);
            setFichierEnAttente(null);
          }}
          onEntrerMotDePasse={(mdp) => {
            setModalePdfProtege(false);
            processFile(fichierEnAttente, mdp);
          }}
          onDevrouiller={() => {
            setModalePdfProtege(false);
            navigate('/dashboard/tools/unprotect', { state: { preloadedFile: fichierEnAttente } });
          }}
        />
      )}

      {/* MODALE D'ERREUR SPÃ‰CIFIQUE (ex: unprotect sur fichier non protÃ©gÃ©) */}
      {uploadError === "Ce PDF n'est pas protÃ©gÃ©. Aucun dÃ©verrouillage n'est nÃ©cessaire." && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade" onClick={() => setUploadError(null)} />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-scale pointer-events-none">
            <div className="bg-surface rounded-2xl shadow-xl max-w-sm w-full p-6 text-center pointer-events-auto">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">info</span>
              </div>
              <h3 className="font-display-xl text-title-md text-on-surface mb-2">Fichier non protÃ©gÃ©</h3>
              <p className="text-body-md text-on-surface-variant mb-6">
                Ce PDF n'a pas de mot de passe. Aucun dÃ©verrouillage n'est nÃ©cessaire.
              </p>
              <button 
                onClick={() => setUploadError(null)}
                className="w-full py-2.5 bg-primary text-on-primary font-label-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE CONFIRMATION D'ANNULATION */}
      {showCancelConfirm && (
        <>
          {/* Fond sombre */}
          <div className="animate-fade visible fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          
          {/* Modal */}
          <div className="animate-scale visible fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="font-display-xl text-title-lg text-on-surface mb-2">Annuler l'importation</h3>
              <p className="text-body-md text-on-surface-variant mb-6">
                Voulez-vous vraiment annuler ? Le fichier sÃ©lectionnÃ© sera retirÃ© de l'atelier de travail.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-5 py-2.5 border border-outline font-label-bold rounded-lg hover:bg-surface-container transition-colors"
                >
                  Non, conserver
                </button>
                <button 
                  onClick={() => {
                    setShowCancelConfirm(false);
                    handleCancelImport();
                  }}
                  className="px-5 py-2.5 bg-error text-on-error font-label-bold rounded-lg hover:bg-error/90 transition-colors"
                >
                  Oui, annuler
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

