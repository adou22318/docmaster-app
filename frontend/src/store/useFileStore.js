import { create } from 'zustand';
import axiosClient from '../services/api/axiosClient';

export const useFileStore = create((set, get) => ({
  // État initial
  currentFile: null, // { fileId, nomOriginal, tailleOctets }
  uploadProgress: 0,
  uploadStatus: 'idle', // 'idle' | 'uploading' | 'done' | 'error'
  uploadError: null,
  filesVersion: 0, // Compteur pour rafraîchir RecentFiles

  // Actions
  startUpload: () => set({ 
    uploadStatus: 'uploading', 
    uploadProgress: 0, 
    uploadError: null 
  }),
  
  setUploadProgress: (progress) => set({ 
    uploadProgress: progress 
  }),
  
  uploadSuccess: (fileData) => set((state) => ({
    currentFile: fileData,
    uploadStatus: 'done',
    uploadProgress: 100,
    uploadError: null,
    filesVersion: state.filesVersion + 1 // Notifier les autres composants
  })),
  
  setUploadError: (message) => set({
    uploadStatus: 'error',
    uploadError: message,
    uploadProgress: 0
  }),
  
  clearCurrentFile: () => set({
    currentFile: null,
    uploadStatus: 'idle',
    uploadProgress: 0,
    uploadError: null
  }),

  /**
   * Annule l'import : si un fichier a déjà été persisté, le supprime
   * côté serveur avant de réinitialiser l'atelier.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  cancelCurrentFile: async () => {
    const { currentFile } = get();
    const fileId = currentFile?.fileId;

    // Pas de fichier persisté (ex. état error avant upload) → reset local seul
    if (!fileId) {
      set({
        currentFile: null,
        uploadStatus: 'idle',
        uploadProgress: 0,
        uploadError: null
      });
      return { success: true };
    }

    try {
      const response = await axiosClient.delete(`/files/${fileId}`);
      if (response.data.success) {
        set((state) => ({
          currentFile: null,
          uploadStatus: 'idle',
          uploadProgress: 0,
          uploadError: null,
          filesVersion: state.filesVersion + 1
        }));
        return { success: true };
      }
      const message = response.data.message || 'Impossible de supprimer le fichier.';
      set({ uploadError: message });
      return { success: false, error: message };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Erreur réseau lors de la suppression du fichier.';
      set({ uploadError: message });
      return { success: false, error: message };
    }
  },

  // Action pour forcer le rafraîchissement manuel
  refreshFiles: () => set((state) => ({
    filesVersion: state.filesVersion + 1
  })),
}));
