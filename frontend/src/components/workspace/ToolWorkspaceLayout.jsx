import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '../../store/useFileStore';
import axiosClient from '../../services/api/axiosClient';

import { FileConfirmation } from './FileConfirmation';
import { JobTracker } from './JobTracker';
import { ResultCard } from './ResultCard';
import { DropZone } from '../dashboard/DropZone';
import { MultiFileSelection } from './MultiFileSelection';
import HowItWorks from './HowItWorks';

import { CompressOptions } from './options/CompressOptions';
import { ProtectOptions } from './options/ProtectOptions';
import { UnprotectOptions } from './options/UnprotectOptions';
import { OfficeToPdfOptions } from './options/OfficeToPdfOptions';
import { PdfToTxtOptions } from './options/PdfToTxtOptions';
import { SplitOptions } from './options/SplitOptions';
import { RemovePagesOptions } from './options/RemovePagesOptions';
import { RotateOptions } from './options/RotateOptions';
import { AddBlankPagesOptions } from './options/AddBlankPagesOptions';
import { PdfToImagesOptions } from './options/PdfToImagesOptions';
import { ExtractImagesOptions } from './options/ExtractImagesOptions';
import { WatermarkOptions } from './options/WatermarkOptions';
import { AddImageOptions } from './options/AddImageOptions';
import { SignOptions } from './options/SignOptions';
import { ImagesToPdfOptions } from './options/ImagesToPdfOptions';

import { PdfThumbnailViewer } from './viewer/PdfThumbnailViewer';
import { PdfSignatureViewer } from './viewer/PdfSignatureViewer';
import { SignatureDisclaimer, isDisclaimerAccepted } from './SignatureDisclaimer';

const OPTIONS_MAP = {
  compress: CompressOptions,
  protect: ProtectOptions,
  unprotect: UnprotectOptions,
  convert_to_pdf: OfficeToPdfOptions,
  pdf_to_txt: PdfToTxtOptions,
  split: SplitOptions,
  remove_pages: RemovePagesOptions,
  rotate: RotateOptions,
  add_blank_pages: AddBlankPagesOptions,
  pdf_to_images: PdfToImagesOptions,
  extract_images: ExtractImagesOptions,
  watermark: WatermarkOptions,
  add_image: AddImageOptions,
  sign: SignOptions,
  convert_images_to_pdf: ImagesToPdfOptions,
};

// Étapes affichées selon le type d'outil
// sansOptions → on saute la configuration, donc seuls 3 étapes visibles
// accepteMultiple → "Sélection" devient "Fichiers"
const getToolSteps = (tool) => {
  if (tool.sansOptions) {
    return [
      { id: 'selection', label: tool.accepteMultiple ? 'Fichiers' : 'Sélection' },
      { id: 'traitement', label: 'Traitement' },
      { id: 'resultat', label: 'Résultat' },
    ];
  }
  return [
    { id: 'selection', label: 'Sélection' },
    { id: 'configuration', label: 'Configuration' },
    { id: 'traitement', label: 'Traitement' },
    { id: 'résultat', label: 'Résultat' },
  ];
};

const ErrorBanner = ({ error, onUnlock }) => {
  if (!error) return null;
  const isEncrypted = error.includes("protégé par un mot de passe");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-error/10 border border-error/30 rounded-xl">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[18px] text-error mt-0.5">error</span>
        <p className="text-body-sm text-error">{error}</p>
      </div>
      {isEncrypted && (
        <button
          onClick={onUnlock}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-error text-on-error rounded-lg text-label-sm font-label-bold hover:bg-error/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">lock_open</span>
          Déverrouiller
        </button>
      )}
    </div>
  );
};

export const ToolWorkspaceLayout = ({ tool, step, setStep, onReset, onBack }) => {
  const navigate = useNavigate();
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobResult, setJobResult] = useState(null);
  const [startError, setStartError] = useState(null);

  const currentFile = useFileStore((state) => state.currentFile);
  const clearCurrentFile = useFileStore((state) => state.clearCurrentFile);

  // État local pour les outils multi-fichiers
  const [multiFiles, setMultiFiles] = useState(() => currentFile ? [currentFile] : []);

  // État local pour la sélection du visualiseur (Niveau 3)
  const [selection, setSelection] = useState([]);
  const [totalPages, setTotalPages] = useState(null);

  // État local pour la signature (Niveau 4)
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signaturePage, setSignaturePage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
  const [signatureSize, setSignatureSize] = useState({ width: 200, height: 100 });
  const [pdfCoords, setPdfCoords] = useState(null);
  const [addDate, setAddDate] = useState(false);
  const [signatureValidee, setSignatureValidee] = useState(null);
  const [signatureDisclaimerAccepted, setSignatureDisclaimerAccepted] = useState(() => isDisclaimerAccepted());
  
  // État local pour le statut "non protégé" (BUG-01)
  const [pdfNonProtege, setPdfNonProtege] = useState(false);

  const OptionsComponent = OPTIONS_MAP[tool.id] || null;
  const isProcessing = step === 'traitement';

  // Étapes adaptées à l'outil
  const toolSteps = getToolSteps(tool);

  // Appelé quand l'utilisateur clique sur "Lancer"
  const handleStart = useCallback(async (options, extraFiles = []) => {
    setStartError(null);
    try {
      // Pour la signature, injecter les coordonnées calculées
      let finalOptions = { ...options };
      if (tool.id === 'sign' && pdfCoords) {
        finalOptions = {
          ...finalOptions,
          x: pdfCoords.x,
          y: pdfCoords.y,
          largeur: pdfCoords.largeur,
          hauteur: pdfCoords.hauteur,
        };
      }
      
      // Injecter le mot de passe s'il a été saisi lors de l'upload
      if (currentFile?.motDePassePdf) {
        finalOptions.motDePassePdf = currentFile.motDePassePdf;
      }

      const payload = {
        type_operation: tool.typeOperation,
        fichiers: tool.accepteMultiple
          ? [...multiFiles.map(f => f.fileId), ...extraFiles]
          : (currentFile ? [currentFile.fileId, ...extraFiles] : [...extraFiles]),
        options: finalOptions,
      };
      const response = await axiosClient.post('/jobs', payload);
      if (response.data.success) {
        setActiveJobId(response.data.data.id_jobs);
        setStep('traitement');
      } else {
        setStartError(response.data.message || 'Erreur lors du lancement.');
      }
    } catch (err) {
      setStartError(err.response?.data?.message || err.message || 'Erreur réseau.');
    }
  }, [tool.typeOperation, tool.accepteMultiple, currentFile, multiFiles, setStep, tool.id, pdfCoords]);

  const handleComplete = useCallback((result) => {
    setJobResult(result);
    setStep('resultat');
  }, [setStep]);

  const handleError = useCallback((errMsg) => {
    setActiveJobId(null);
    setStartError(errMsg || null);
    // Pour les outils sans options, on revient en sélection
    setStep(tool.sansOptions ? 'selection' : 'configuration');
  }, [setStep, tool.sansOptions]);

  const handleReset = () => {
    // BUG-05 : Supprimer silencieusement le fichier uploadé pour qu'il
    // ne reste pas dans la liste "Fichiers récents" après annulation
    if (currentFile?.fileId) {
      axiosClient.delete(`/files/${currentFile.fileId}`).catch(() => {});
    }
    clearCurrentFile();
    setMultiFiles([]);
    setSelection([]);
    setSignaturePreview(null);
    setSignatureValidee(null);
    setPdfCoords(null);
    setPdfNonProtege(false);
    setActiveJobId(null);
    setJobResult(null);
    setStartError(null);
    setStep('selection');
    onReset?.();
  };

  const handleUnlockRedirect = () => {
    navigate('/dashboard/tools/unprotect', { state: { preloadedFile: currentFile } });
  };

  const handleBackClick = () => {
    if (isProcessing) {
      const ok = window.confirm('Quitter maintenant abandonnera le traitement en cours. Continuer ?');
      if (!ok) return;
    }
    onBack();
  };

  const currentStepIndex = toolSteps.findIndex(s => s.id === step);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col">
      {/* BUG-04 : Afficher le disclaimer dès l'entrée de l'outil (quel que soit l'étape) */}
      {tool.id === 'sign' && !signatureDisclaimerAccepted && (
        <SignatureDisclaimer onAccept={() => setSignatureDisclaimerAccepted(true)} />
      )}

      {/* ── Barre de contexte de l'outil ─────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-surface border-b border-outline-variant shadow-sm">
        <div className="px-6 md:px-10 h-16 flex items-center justify-between gap-4">

          {/* Gauche : retour + identité de l'outil */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBackClick}
              className="flex-shrink-0 flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors group"
            >
              <span className="material-symbols-outlined text-[22px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span className="text-label-md hidden sm:inline">Atelier</span>
            </button>

            <span className="text-outline-variant flex-shrink-0">/</span>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px] text-on-secondary-container">{tool.icone}</span>
              </div>
              <span className="font-label-bold text-label-lg text-on-surface truncate">{tool.nom}</span>
            </div>
          </div>

          {/* Centre : étapes numérotées adaptées à l'outil */}
          <div className="hidden md:flex items-center gap-2">
            {toolSteps.map((s, i) => {
              const isDone = i < currentStepIndex;
              const isActive = s.id === step;
              return (
                <React.Fragment key={s.id}>
                  {i > 0 && (
                    <div className={`h-px w-8 transition-colors ${isDone ? 'bg-secondary' : 'bg-outline-variant'}`} />
                  )}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-label-bold transition-colors ${
                    isActive
                      ? 'bg-secondary-container text-primary'
                      : isDone
                        ? 'bg-transparent text-secondary'
                        : 'bg-transparent text-outline'
                  }`}>
                    {isDone
                      ? <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      : <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] ${isActive ? 'border-secondary bg-secondary text-on-secondary' : 'border-outline'}`}>{i + 1}</span>
                    }
                    <span>{s.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Droite : réinitialiser */}
          <button
            onClick={handleReset}
            disabled={isProcessing}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container transition-colors disabled:opacity-40 text-label-sm font-label-bold"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* ── Corps principal ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Zone principale */}
        <div className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">

            {/* ÉTAPE : sélection */}
            {step === 'selection' && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display-xl text-headline-md text-on-surface mb-1">{tool.nom}</h1>
                  <p className="text-body-md text-on-surface-variant">{tool.description}</p>
                </div>

                {/* Erreur de lancement (outils sans options) */}
                <ErrorBanner error={startError} onUnlock={handleUnlockRedirect} />

                {tool.accepteMultiple ? (
                  /* Outils multi-fichiers (Fusion) */
                  <MultiFileSelection
                    tool={tool}
                    multiFiles={multiFiles}
                    setMultiFiles={setMultiFiles}
                    onStart={tool.sansOptions ? handleStart : undefined}
                    onContinue={tool.sansOptions ? undefined : () => setStep('configuration')}
                  />
                ) : currentFile ? (
                  /* Fichier déjà sélectionné */
                  <FileConfirmation
                    file={currentFile}
                    tool={tool}
                    onChangeFile={handleReset}
                    startError={null}
                    onStart={tool.sansOptions ? handleStart : undefined}
                    isProcessing={isProcessing}
                  />
                ) : (
                  /* Aucun fichier : zone d'upload */
                  <DropZone 
                    toolId={tool.id} 
                    onPdfNonProtege={(file) => {
                      // Forcer le fichier et l'état non protégé (BUG-01)
                      useFileStore.getState().uploadSuccess({
                        fileId: 'dummy-id',
                        nomOriginal: file.name,
                        tailleOctets: file.size
                      });
                      setPdfNonProtege(true);
                      setStep('configuration');
                    }}
                  />
                )}
              </div>
            )}

            {/* ÉTAPE : configuration (uniquement pour les outils avec options) */}
            {step === 'configuration' && (
              tool.utiliseVisualiseurSignature ? (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display-xl text-headline-md text-on-surface mb-1">{tool.nom}</h1>
                    <p className="text-body-md text-on-surface-variant">{tool.description}</p>
                  </div>
                  <button onClick={handleReset} className="flex items-center gap-2 text-label-sm text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    Changer de fichier
                  </button>
                  <ErrorBanner error={startError} onUnlock={handleUnlockRedirect} />
                  <PdfSignatureViewer
                    fileId={currentFile?.fileId}
                    motDePassePdf={currentFile?.motDePassePdf}
                    signaturePreview={signatureValidee || signaturePreview}
                    currentPage={signaturePage}
                    setCurrentPage={setSignaturePage}
                    onLoadSuccess={setTotalPages}
                    signaturePosition={signaturePosition}
                    setSignaturePosition={setSignaturePosition}
                    signatureSize={signatureSize}
                    setSignatureSize={setSignatureSize}
                    onPdfCoordsChange={setPdfCoords}
                  />
                </div>
              ) : tool.utiliseVisualiseur ? (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display-xl text-headline-md text-on-surface mb-1">{tool.nom}</h1>
                    <p className="text-body-md text-on-surface-variant">{tool.description}</p>
                  </div>
                  <button onClick={handleReset} className="flex items-center gap-2 text-label-sm text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    Changer de fichier
                  </button>
                  <ErrorBanner error={startError} onUnlock={handleUnlockRedirect} />
                  <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden p-4 shadow-sm">
                    <PdfThumbnailViewer
                      fileId={currentFile?.fileId}
                      motDePassePdf={currentFile?.motDePassePdf}
                      mode={tool.selectionMode || 'multiple'}
                      selection={selection}
                      onSelectionChange={setSelection}
                      selectionStyle={tool.selectionStyle || 'blue'}
                      onLoadSuccess={setTotalPages}
                    />
                  </div>
                </div>
              ) : (
                <FileConfirmation
                  file={currentFile}
                  tool={tool}
                  onChangeFile={handleReset}
                  startError={startError}
                />
              )
            )}

            {/* ÉTAPE : traitement */}
            {step === 'traitement' && (
              <JobTracker
                tool={tool}
                jobId={activeJobId}
                onComplete={handleComplete}
                onError={handleError}
              />
            )}

            {/* ÉTAPE : résultat */}
            {step === 'resultat' && (
              <ResultCard
                tool={tool}
                result={jobResult}
                originalFile={tool.accepteMultiple ? (multiFiles[0] || null) : currentFile}
                onNewFile={handleReset}
              />
            )}

            {/* CORRECTION-03 : Section "Comment ça marche" en bas de la page */}
            {tool?.howItWorks && (
              <HowItWorks
                etapes={tool.howItWorks.etapes}
                conseil={tool.howItWorks.conseil}
              />
            )}
          </div>
        </div>

        {/* Panneau options latéral (desktop) — uniquement pour les outils avec options */}
        {step === 'configuration' && OptionsComponent && (
          <div className="hidden lg:flex flex-col w-[350px] shrink-0 border-l border-outline-variant bg-surface shadow-sm z-10 relative h-full">
            <OptionsComponent
              onStart={handleStart}
              isProcessing={isProcessing}
              fichierCharge={currentFile}
              selection={selection}
              totalPages={totalPages}
              // Props specifiques à SignOptions
              signaturePreview={signaturePreview}
              setSignaturePreview={setSignaturePreview}
              signaturePage={signaturePage}
              setSignaturePage={setSignaturePage}
              addDate={addDate}
              setAddDate={setAddDate}
              onSignatureValide={setSignatureValidee}
              fichierNonProtege={pdfNonProtege}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Bouton flottant mobile */}
        {step === 'configuration' && OptionsComponent && (
          <MobileOptionsDrawer
            tool={tool}
            onStart={handleStart}
            isProcessing={isProcessing}
            OptionsComponent={OptionsComponent}
            fichierCharge={currentFile}
            selection={selection}
            totalPages={totalPages}
            // Props specifiques à SignOptions
            signaturePreview={signaturePreview}
            setSignaturePreview={setSignaturePreview}
            signaturePage={signaturePage}
            setSignaturePage={setSignaturePage}
            addDate={addDate}
            setAddDate={setAddDate}
            onSignatureValide={setSignatureValidee}
            fichierNonProtege={pdfNonProtege}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

// Drawer mobile simplifié
const MobileOptionsDrawer = ({ onStart, isProcessing, OptionsComponent, selection, totalPages, ...rest }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-full shadow-lg font-label-bold hover:bg-primary/90 transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">tune</span>
        Configurer &amp; lancer
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-surface rounded-t-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant shrink-0 bg-surface z-10">
              <h3 className="font-display-md text-title-lg text-primary">Options de traitement</h3>
              <button onClick={() => setOpen(false)} className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden relative pb-safe">
              <OptionsComponent
                onStart={(opts) => { setOpen(false); onStart(opts); }}
                isProcessing={isProcessing}
                selection={selection}
                totalPages={totalPages}
                {...rest}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
