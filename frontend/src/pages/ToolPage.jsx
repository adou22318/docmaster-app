import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { tools } from '../data/tools';
import { useFileStore } from '../store/useFileStore';
import { ToolWorkspaceLayout } from '../components/workspace/ToolWorkspaceLayout';

export const ToolPage = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();

  const currentFile = useFileStore((state) => state.currentFile);
  const clearCurrentFile = useFileStore((state) => state.clearCurrentFile);

  // Recherche de l'outil dans la configuration
  const tool = tools.find((t) => t.id === toolId);

  // Si l'outil n'existe pas, redirection immédiate
  if (!tool) {
    return <Navigate to="/dashboard" replace />;
  }

  // Initialisation de l'étape :
  // Si l'outil ne nécessite qu'un seul fichier ET qu'un fichier est déjà chargé
  // dans le store (upload depuis le dashboard), on passe directement à 'configuration'.
  const [step, setStep] = useState(() => {
    if (!tool.accepteMultiple && currentFile) return 'configuration';
    return 'selection';
  });

  // Transition automatique vers 'configuration' quand l'upload est terminé
  // (l'utilisateur a uploadé directement depuis la page outil via la DropZone)
  useEffect(() => {
    if (step === 'selection' && currentFile && !tool.accepteMultiple) {
      setStep('configuration');
    }
  }, [currentFile, step, tool.accepteMultiple]);

  const handleReset = () => {
    clearCurrentFile();
    setStep('selection');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <ToolWorkspaceLayout
      tool={tool}
      step={step}
      setStep={setStep}
      onReset={handleReset}
      onBack={handleBack}
    />
  );
};
