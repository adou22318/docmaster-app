import React, { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';
import { useFileStore } from '../../store/useFileStore';
import { useToast } from '../../context/ToastContext';
import { ErrorBanner } from '../layout/ErrorBanner';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { formatSize } from '../../utils/formatters';
import { ConfirmDialog } from '../ui/ConfirmDialog';

// ─── COMPOSANT ENFANT POUR ANIMER CHAQUE LIGNE ───────────────────────
const FileRow = ({ file, index, onDownload, onDelete, downloadingId }) => {
  const { ref, inView } = useScrollAnimation(0.1);
  const { icon, color } = getFileIcon(file.nom_original);
  const isDownloading = downloadingId === file.id;

  return (
    <tr
      ref={ref}
      className={`hover:bg-surface-container-low/50 transition-all group animate-slide-left delay-${Math.min(index, 5)} ${inView ? 'visible' : ''}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 max-w-[250px]">
          <span className={`material-symbols-outlined ${color}`}>{icon}</span>
          <span className="font-label-bold truncate" title={file.nom_original}>{file.nom_original}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-on-surface-variant text-body-sm whitespace-nowrap">
        {formatDate(file.created_at)}
      </td>
      <td className="px-6 py-4 text-on-surface-variant text-body-sm whitespace-nowrap">
        {formatSize(file.taille_octets)}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button 
            className="p-2 hover:bg-secondary-container/20 rounded-lg text-primary transition-colors flex items-center justify-center min-w-[40px]"
            onClick={() => onDownload(file.id, file.nom_original)}
            disabled={isDownloading}
            title="Télécharger"
          >
            {isDownloading ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-sm">download</span>
            )}
          </button>
          
          <button 
            className="p-2 hover:bg-secondary-container/20 rounded-lg text-primary transition-colors"
            title="Partager (bientôt)"
            onClick={() => alert("Fonctionnalité disponible prochainement.")}
          >
            <span className="material-symbols-outlined text-sm">share</span>
          </button>
          
          <button 
            className="p-2 hover:bg-error-container text-error rounded-lg transition-colors"
            onClick={() => onDelete(file)}
            title="Supprimer"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── UTILITAIRES ─────────────────────────────────────────────────────

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  const hier = new Date(now);
  hier.setDate(hier.getDate() - 1);
  if (date.toDateString() === hier.toDateString()) {
    return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) + ` à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'pdf') return { icon: 'picture_as_pdf', color: 'text-red-600' };
  if (['jpg', 'jpeg', 'png', 'tiff', 'tif'].includes(ext)) return { icon: 'image', color: 'text-blue-600' };
  if (['docx', 'xlsx', 'pptx'].includes(ext)) return { icon: 'description', color: 'text-blue-800' };
  return { icon: 'insert_drive_file', color: 'text-on-surface-variant' };
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────
export const RecentFiles = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vue, setVue] = useState(() => localStorage.getItem('docmaster_files_view') || 'liste');
  const [gridAnimKey, setGridAnimKey] = useState(0); // incrémenté à chaque activation grille
  
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const { ref: sectionRef, inView: sectionInView } = useScrollAnimation(0.1);
  const toast = useToast();

  // Store : écouter filesVersion pour rafraîchir, et avoir accès à currentFile pour sync DropZone
  const filesVersion = useFileStore((state) => state.filesVersion);
  const currentFile  = useFileStore((state) => state.currentFile);
  const clearCurrentFile = useFileStore((state) => state.clearCurrentFile);
  const refreshFiles = useFileStore((state) => state.refreshFiles);

  const handleVueChange = (nouvelleVue) => {
    setVue(nouvelleVue);
    localStorage.setItem('docmaster_files_view', nouvelleVue);
    // Forcer le re-mount de la grille pour déclencher les animations
    if (nouvelleVue === 'grille') {
      setGridAnimKey(k => k + 1);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [filesVersion]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get('/files');
      if (response.data.success) {
        setFiles(response.data.data);
      }
    } catch (err) {
      setError("Impossible de charger vos fichiers récents.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      setDownloadingId(id);
      const response = await axiosClient.get(`/files/download/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Le téléchargement a échoué.");
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      setIsDeleting(true);
      const response = await axiosClient.delete(`/files/${fileToDelete.id}`);
      if (response.data.success) {
        // 1. Si le fichier supprimé est celui chargé dans la DropZone → on la vide
        if (currentFile?.fileId === fileToDelete.id) {
          clearCurrentFile();
        }
        // 2. Toast de confirmation
        toast.success(`« ${fileToDelete.nom_original} » a été supprimé avec succès.`);
        // 3. Retirer le fichier de la liste locale ET forcer un refresh store
        setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
        refreshFiles();
        setFileToDelete(null);
      } else {
        toast.error(response.data.message || 'La suppression a échoué.');
        setFileToDelete(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'La suppression a échoué.');
      setFileToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section ref={sectionRef} className="space-y-6">
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      
      {/* Titre + toggle vue */}
      <div className={`flex justify-between items-center animate-fade ${sectionInView ? 'visible' : ''}`}>
        <h4 className="font-display-xl text-headline-md">Fichiers Récents</h4>
        <div className="flex gap-2">
          <button
            onClick={() => handleVueChange('grille')}
            title="Vue grille"
            className={`p-2 rounded-lg transition-colors ${vue === 'grille' ? 'bg-primary text-on-primary shadow-sm' : 'border border-outline-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button
            onClick={() => handleVueChange('liste')}
            title="Vue liste"
            className={`p-2 rounded-lg transition-colors ${vue === 'liste' ? 'bg-primary text-on-primary shadow-sm' : 'border border-outline-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </div>
      
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm relative min-h-[200px]">
        {/* SKELETON LOADING */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-surface flex flex-col">
            <div className="h-14 border-b border-outline-variant bg-surface-container-low"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-1 border-b border-outline-variant/30 flex items-center px-6 gap-6 animate-pulse">
                <div className="w-8 h-8 bg-surface-container-high rounded-lg"></div>
                <div className="w-1/3 h-4 bg-surface-container-high rounded-full"></div>
                <div className="w-1/4 h-4 bg-surface-container-high rounded-full ml-auto"></div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">folder_open</span>
            <p className="text-body-lg text-on-surface-variant max-w-md">
              Aucun fichier pour le moment. Commencez par déposer un fichier ci-dessus.
            </p>
          </div>
        )}

        {/* VUE LISTE (tableau) */}
        {!isLoading && files.length > 0 && vue === 'liste' && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-widest">Nom du fichier</th>
                  <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-widest">Taille</th>
                  <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {files.map((file, index) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    index={index}
                    onDownload={handleDownload}
                    onDelete={setFileToDelete}
                    downloadingId={downloadingId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VUE GRILLE (cards) */}
        {!isLoading && files.length > 0 && vue === 'grille' && (
          <div
            key={gridAnimKey}
            className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            {files.map((file, index) => {
              const { icon, color } = getFileIcon(file.nom_original);
              const isDownloading = downloadingId === file.id;
              return (
                <div
                  key={file.id}
                  className={`animate-fade-up delay-${Math.min(index, 6)} ${sectionInView ? 'visible' : ''}
                    group relative flex flex-col items-center gap-2 p-3 rounded-2xl border
                    border-outline-variant bg-surface-container
                    hover:border-primary/40 hover:bg-primary/5
                    hover:shadow-md hover:-translate-y-0.5
                    transition-all cursor-default`}
                >
                  <span className={`material-symbols-outlined text-[40px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <p className="text-label-sm font-label-bold text-on-surface text-center truncate w-full" title={file.nom_original}>
                    {file.nom_original}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">{formatSize(file.taille_octets)}</p>
                  {/* Actions au survol */}
                  <div className="absolute inset-0 rounded-2xl bg-surface/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(file.id, file.nom_original)}
                      disabled={isDownloading}
                      className="p-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors"
                      title="Télécharger"
                    >
                      {isDownloading
                        ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        : <span className="material-symbols-outlined text-[18px]">download</span>
                      }
                    </button>
                    <button
                      onClick={() => setFileToDelete(file)}
                      className="p-2 rounded-xl bg-error-container text-error hover:bg-error/20 transition-colors"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!fileToDelete}
        title="Confirmer la suppression"
        message={
          <>
            Voulez-vous vraiment supprimer le fichier <strong>{fileToDelete?.nom_original}</strong> ? Cette action est irréversible.
          </>
        }
        confirmText={isDeleting ? "Suppression..." : "Supprimer définitivement"}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setFileToDelete(null)}
        isDestructive={true}
      />
    </section>
  );
};
