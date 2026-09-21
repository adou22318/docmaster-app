import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../services/api/axiosClient';
import { formatSize } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useFileStore } from '../store/useFileStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
export const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const currentFile    = useFileStore((s) => s.currentFile);
  const clearCurrentFile = useFileStore((s) => s.clearCurrentFile);
  const refreshFiles   = useFileStore((s) => s.refreshFiles);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/files?limit=50');
      if (response.data.success) {
        setFiles(response.data.data);
      }
    } catch (err) {
      setError('Impossible de charger vos fichiers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async () => {
    if (!fileToDelete) return;
    const id = fileToDelete.id_files || fileToDelete.id;
    const nom = fileToDelete.nom_original || 'le fichier';
    try {
      setIsDeleting(true);
      await axiosClient.delete(`/files/${id}`);
      // Si le fichier supprimé est dans la DropZone, on la vide
      if (currentFile?.fileId === id) {
        clearCurrentFile();
      }
      setFiles(prev => prev.filter(f => f.id_files !== id && f.id !== id));
      refreshFiles(); // sync RecentFiles
      toast.success(`« ${nom} » supprimé avec succès.`);
    } catch (err) {
      toast.error('Erreur lors de la suppression. Réessayez.');
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  const handleDownload = async (id, nomOriginal) => {
    try {
      toast.info('Téléchargement en cours...');
      const response = await axiosClient.get(`/files/download/${id}`, { responseType: 'blob' });
      
      const blobUrl = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = nomOriginal || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      toast.error('Impossible de télécharger le fichier. Le lien a peut-être expiré.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header de page — identique au style ToolWorkspaceLayout */}
      <div className="sticky top-0 z-20 bg-surface border-b border-outline-variant shadow-sm">
        <div className="px-6 md:px-10 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-[22px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-label-md hidden sm:inline">Atelier</span>
          </button>
          <span className="text-outline-variant">/</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-on-secondary-container">folder_open</span>
            </div>
            <span className="font-label-bold text-label-lg text-on-surface">Fichiers actifs</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display-xl text-headline-md text-primary">Fichiers actifs</h1>
            <p className="text-on-surface-variant mt-1">Vos fichiers uploads et résultats en cours de vie (max 24h).</p>
          </div>
          <button
            onClick={fetchFiles}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-label-sm font-label-bold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* Bannière 24h */}
        <div className="flex items-start gap-3 bg-secondary-container/20 border border-secondary/30 px-4 py-3 rounded-xl mb-8 text-body-sm">
          <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5 flex-shrink-0">schedule</span>
          <p className="text-on-surface-variant">
            <span className="font-label-bold text-primary">Suppression automatique : </span>
            conformément à notre politique de confidentialité, tous vos fichiers sont{' '}
            <strong>définitivement supprimés 24h après leur création</strong>. Téléchargez vos résultats avant ce délai.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-error/10 text-error border border-error/20 p-4 rounded-xl mb-6">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-24 bg-surface-container rounded-3xl border border-outline-variant border-dashed">
            <span className="material-symbols-outlined text-[52px] text-on-surface-variant mb-4 block">folder_off</span>
            <h3 className="font-label-bold text-title-md text-primary mb-2">Aucun fichier actif</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto">
              Vos fichiers apparaîtront ici après avoir utilisé un outil. Ils sont conservés pendant 24h.
            </p>
          </div>
        ) : (
          <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant">
                  <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider">Nom du fichier</th>
                  <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Taille</th>
                  <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Créé le</th>
                  <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Expire</th>
                  <th className="py-3 px-4 text-label-sm font-label-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const fileId = file.id_files || file.id;
                  const expireDate = file.expire_le ? new Date(file.expire_le) : null;
                  const isExpiringSoon = expireDate && (expireDate - Date.now()) < 2 * 60 * 60 * 1000;
                  let expireDateLabel = null;
                  let expireRelativeLabel = null;
                  if (expireDate) {
                    const msLeft = expireDate - Date.now();
                    const h = Math.floor(msLeft / 3600000);
                    const m = Math.floor((msLeft % 3600000) / 60000);
                    expireDateLabel = expireDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                    expireRelativeLabel = msLeft > 0 ? (h > 0 ? 'dans ' + h + 'h ' + m + 'min' : 'dans ' + m + 'min') : 'Expire';
                  }
                  return (
                    <tr key={fileId} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${isExpiringSoon ? 'text-warning' : 'text-secondary-container'}`}>
                            {file.type_mime?.includes('zip') ? 'folder_zip' : 'picture_as_pdf'}
                          </span>
                          <div>
                            <span className="font-label-bold text-body-sm text-primary max-w-[180px] sm:max-w-[280px] truncate block" title={file.nom_original}>
                              {file.nom_original}
                            </span>
                            {isExpiringSoon && (
                              <span className="text-[10px] text-warning font-label-bold">⚠ Expire bientôt</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden sm:table-cell">
                        {formatSize(file.taille_octets)}
                      </td>
                      <td className="py-4 px-4 text-body-sm text-on-surface-variant hidden md:table-cell">
                        {new Date(file.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-4 text-body-sm hidden lg:table-cell">
                        {expireDateLabel ? (
                          <span
                            className={isExpiringSoon ? 'text-warning font-label-bold' : 'text-on-surface-variant'}
                            title={expireRelativeLabel}
                          >
                            {expireDateLabel}
                            {isExpiringSoon && (
                              <span className="block text-[10px] text-warning">({expireRelativeLabel})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleDownload(fileId, file.nom_original)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                          title="Télécharger"
                        >
                          <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {/* Modal de suppression */}
      <ConfirmDialog
        isOpen={!!fileToDelete}
        title="Confirmer la suppression"
        message={
          <>
            Voulez-vous vraiment supprimer le fichier <strong>{fileToDelete?.nom_original}</strong> ? Cette action est irréversible.
          </>
        }
        confirmText={isDeleting ? "Suppression..." : "Supprimer définitivement"}
        onConfirm={handleDelete}
        onCancel={() => !isDeleting && setFileToDelete(null)}
        isDestructive={true}
      />
    </div>
  );
};
