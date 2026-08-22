import React, { useState, useRef, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosClient from '../../services/api/axiosClient';
import { ErrorBanner } from '../layout/ErrorBanner';
import { formatSize } from '../../utils/formatters';

const ALLOWED_EXTENSIONS = {
  merge: ['.pdf'],
  convert_images_to_pdf: ['.jpg', '.jpeg', '.png', '.tiff', '.tif']
};
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo
const MAX_FILES = 20;

export const MultiFileSelection = ({ tool, multiFiles, setMultiFiles, onStart, onContinue }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState([]); // Array de { id, name, progress }
  const fileInputRef = useRef(null);

  const allowedExts = ALLOWED_EXTENSIONS[tool.id] || ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.xlsx', '.pptx', '.tiff', '.tif'];

  const validateFile = (file) => {
    if (!file) return false;
    
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExts.includes(fileExt)) {
      setUploadError(`Format non supporté pour cet outil. Formats acceptés : ${allowedExts.join(', ')}.`);
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Un fichier est trop volumineux. Maximum 50 Mo par fichier.');
      return false;
    }
    
    return true;
  };

  const processFiles = async (files) => {
    const validFiles = Array.from(files).filter(validateFile);
    if (validFiles.length === 0) return;

    if (multiFiles.length + uploadingFiles.length + validFiles.length > MAX_FILES) {
      setUploadError(`Vous avez atteint la limite de ${MAX_FILES} fichiers. Retirez des fichiers pour continuer.`);
      return;
    }

    const newUploads = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      name: file.name
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    // Upload en parallèle
    newUploads.forEach(async (uploadItem) => {
      const formData = new FormData();
      formData.append('file', uploadItem.file);

      try {
        const response = await axiosClient.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadingFiles(prev => prev.map(u => 
              u.id === uploadItem.id ? { ...u, progress: percentCompleted } : u
            ));
          },
        });

        if (response.data.success) {
          const fileData = response.data.data;
          const resolvedId = fileData?.file?.id_files || fileData?.file?.id || fileData?.id_files || fileData?.id;

          if (resolvedId) {
            const newFileRecord = {
              fileId: resolvedId,
              nomOriginal: fileData?.file?.nom_original || fileData?.nom_original || uploadItem.name,
              tailleOctets: fileData?.file?.taille_octets || fileData?.taille_octets || uploadItem.file.size
            };
            
            setMultiFiles(prev => [...prev, newFileRecord]);
            setUploadingFiles(prev => prev.filter(u => u.id !== uploadItem.id));
          }
        }
      } catch (error) {
        console.error('Erreur upload:', error);
        setUploadError(`Erreur lors de l'envoi de ${uploadItem.name}`);
        setUploadingFiles(prev => prev.filter(u => u.id !== uploadItem.id));
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (fileId) => {
    setMultiFiles(prev => prev.filter(f => f.fileId !== fileId));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(multiFiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setMultiFiles(items);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6">
      
      {uploadError && (
        <ErrorBanner 
          message={uploadError} 
          onClose={() => setUploadError(null)} 
        />
      )}

      {/* Zone de dépôt (visible si on a la place) */}
      {multiFiles.length + uploadingFiles.length < MAX_FILES && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full p-8 border-2 border-dashed rounded-3xl transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
            isDragging
              ? 'border-secondary bg-secondary-container/30'
              : 'border-outline-variant hover:border-secondary hover:bg-surface-container/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={allowedExts.join(',')}
            multiple
          />
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[32px] text-primary">note_add</span>
          </div>
          <h3 className="font-display-md text-title-md text-on-surface mb-2">
            Ajouter des fichiers
          </h3>
          <p className="text-body-sm text-on-surface-variant max-w-sm">
            Faites glisser d'autres fichiers ici ou cliquez pour parcourir.
            Formats : {allowedExts.join(', ')}.
          </p>
        </div>
      )}

      {/* Liste des fichiers */}
      {(multiFiles.length > 0 || uploadingFiles.length > 0) && (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between px-2">
            <h4 className="font-label-bold text-label-lg text-on-surface">Fichiers sélectionnés</h4>
            <span className="text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
              {multiFiles.length + uploadingFiles.length} / {MAX_FILES}
            </span>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="files-list">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {multiFiles.map((file, index) => (
                    <Draggable key={file.fileId} draggableId={file.fileId.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 p-3 bg-surface rounded-xl border transition-shadow ${
                            snapshot.isDragging ? 'shadow-md border-secondary bg-surface-container/50' : 'border-outline-variant'
                          }`}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="text-on-surface-variant hover:text-on-surface cursor-grab active:cursor-grabbing"
                          >
                            <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                          </div>
                          
                          <div className="w-10 h-10 rounded-lg bg-secondary-container/50 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-secondary text-[20px]">
                              {tool.id === 'merge' ? 'picture_as_pdf' : 'image'}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-label-md font-label-bold text-on-surface truncate">
                              {file.nomOriginal}
                            </p>
                            <p className="text-label-sm text-on-surface-variant">
                              {formatSize(file.tailleOctets)}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleRemove(file.fileId)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container transition-colors shrink-0"
                            title="Retirer"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Fichiers en cours d'upload */}
          {uploadingFiles.map(file => (
            <div key={file.id} className="flex items-center gap-4 p-3 bg-surface rounded-xl border border-outline-variant opacity-70">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-label-bold text-on-surface truncate">
                  {file.name}
                </p>
                <div className="w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton de confirmation (au moins 2 fichiers requis pour ces outils) */}
      {/* Bouton principal — direct si sansOptions, étape sinon */}
      {onStart ? (
        // Lancer directement le traitement
        <button
          onClick={() => onStart({})}
          disabled={multiFiles.length < 2 || uploadingFiles.length > 0}
          className="w-full max-w-sm flex items-center justify-center gap-2 py-4 mt-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">merge</span>
          <span>Fusionner les fichiers</span>
        </button>
      ) : (
        // Passer à la configuration
        <button
          onClick={onContinue}
          disabled={multiFiles.length < 2 || uploadingFiles.length > 0}
          className="w-full max-w-sm flex items-center justify-center gap-2 py-4 mt-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
        >
          <span>Passer à la configuration</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      )}
      
      {multiFiles.length < 2 && multiFiles.length > 0 && uploadingFiles.length === 0 && (
        <p className="text-label-sm text-on-surface-variant text-center">
          Veuillez ajouter au moins 2 fichiers pour continuer.
        </p>
      )}

    </div>
  );
};
