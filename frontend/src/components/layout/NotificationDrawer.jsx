import React, { useState, useEffect } from 'react';
import axiosClient from '../../services/api/axiosClient';
import { useToast } from '../../context/ToastContext';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      // Enregistrer le moment de l'ouverture pour réinitialiser le badge
      localStorage.setItem('lastNotificationReadTime', new Date().toISOString());
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/jobs');
      if (response.data.success) {
        // Garder uniquement done et error des dernières 24h
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const filtered = response.data.data.filter(job => {
          const completedAt = job.completed_at ? new Date(job.completed_at) : new Date(job.created_at);
          return (job.status === 'done' || job.status === 'error') && completedAt >= yesterday;
        });
        
        setNotifications(filtered);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'compress': 'Compression',
      'merge': 'Fusion',
      'split': 'Division',
      'protect': 'Protection',
      'sign': 'Signature',
      'pdf_to_images': 'Conversion en Images',
      'clean_metadata': 'Nettoyage métadonnées'
    };
    return labels[type] || type;
  };

  const handleDownload = async (resultatUrl, jobId) => {
    if (!resultatUrl) return;
    try {
      setDownloadingId(jobId);
      toast.info('Téléchargement en cours...');
      // resultatUrl est sous la forme /api/files/download/<uuid>
      // on récupère l'UUID à la fin
      const fileIdMatch = resultatUrl.match(/\/download\/([a-f0-9-]+)$/i);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;

      if (!fileId) throw new Error("ID de fichier introuvable dans l'URL");

      const response = await axiosClient.get(`/files/download/${fileId}`, { responseType: 'blob' });
      
      const blobUrl = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'resultat.zip'; // Nom par défaut, le navigateur prendra l'extension correcte si disponible
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      toast.error('Impossible de télécharger le fichier. Le lien a peut-être expiré.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-40" 
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-surface shadow-2xl z-50 transform transition-transform border-l border-outline-variant flex flex-col">
        
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h2 className="font-display-xl text-headline-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container">notifications</span>
            Notifications
          </h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
          {loading ? (
            <div className="flex justify-center p-8">
              <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-12">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">notifications_paused</span>
              <p className="font-label-bold text-primary">Aucune notification</p>
              <p className="text-body-sm text-on-surface-variant mt-2">Vous n'avez effectué aucun traitement récemment.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id_jobs} 
                className={`p-4 rounded-xl border ${notif.status === 'error' ? 'bg-error-container border-error/20' : 'bg-surface-container border-outline-variant'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-label-bold text-label-md ${notif.status === 'error' ? 'text-error' : 'text-primary'}`}>
                    {getTypeLabel(notif.type_operation)}
                  </span>
                  <span className="text-[10px] font-label-bold text-on-surface-variant uppercase">
                    {new Date(notif.completed_at || notif.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-body-sm text-on-surface-variant">
                  {notif.status === 'done' 
                    ? 'Le traitement s\'est terminé avec succès.' 
                    : 'Une erreur est survenue lors du traitement du fichier.'}
                </p>
                
                {notif.status === 'done' && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-secondary">
                      Le résultat sera supprimé d'ici 24h.
                    </p>
                    {notif.resultat_url && (
                      <button
                        onClick={() => handleDownload(notif.resultat_url, notif.id_jobs)}
                        disabled={downloadingId === notif.id_jobs}
                        className="text-primary hover:text-primary/80 font-label-bold text-label-sm flex items-center gap-1 transition-colors"
                      >
                        {downloadingId === notif.id_jobs ? (
                          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">download</span>
                        )}
                        Télécharger
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
