import React from 'react';
import { createPortal } from 'react-dom';
import axiosClient from '../../services/api/axiosClient';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useToast } from '../../context/ToastContext';

/**
 * Drawer de notifications branché sur useNotificationStore (Zustand in-memory).
 * Les notifications sont alimentées par JobTracker quand un job se termine.
 */
export const NotificationDrawer = ({ isOpen, onClose }) => {
  const notifications = useNotificationStore((s) => s.notifications);
  const supprimerNotification = useNotificationStore((s) => s.supprimerNotification);
  const toutEffacer = useNotificationStore((s) => s.toutEffacer);
  const toast = useToast();

  const handleDownload = async (notification) => {
    if (!notification.resultatUrl) return;
    try {
      // resultatUrl est un chemin relatif comme "/api/files/download/uuid"
      const response = await axiosClient.get(notification.resultatUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resultat_${notification.jobId || 'fichier'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Téléchargement impossible. Le fichier est peut-être expiré.');
    }
  };

  const formatTemps = (timestamp) => {
    const diff = Date.now() - timestamp;
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `Il y a ${h}h`;
    if (m > 0) return `Il y a ${m} min`;
    return "À l'instant";
  };

  const drawerContent = (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panneau */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-outline-variant shadow-2xl z-[9999] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
            <h2 className="font-display-xl text-title-md text-on-surface">Notifications</h2>
            {notifications.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-label-xs text-on-surface-variant">
                {notifications.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={toutEffacer}
                className="text-label-sm text-on-surface-variant hover:text-error transition-colors px-2 py-1 rounded-lg hover:bg-error-container"
                title="Tout effacer"
              >
                Tout effacer
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
            </button>
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            /* État vide */
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-outline">notifications_off</span>
              </div>
              <div>
                <p className="font-display-xl text-title-sm text-on-surface mb-1">Aucune notification</p>
                <p className="text-body-sm text-on-surface-variant">
                  Vos traitements terminés apparaîtront ici.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/30">
              {notifications.map((notif) => (
                <li key={notif.id} className={`px-5 py-4 transition-colors hover:bg-surface-container/50 ${notif.lu ? '' : 'bg-primary/3'}`}>
                  <div className="flex items-start gap-3">
                    {/* Icône statut */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      notif.type === 'success' ? 'bg-green-500/15 text-green-700' :
                      notif.type === 'error'   ? 'bg-error-container text-error' :
                      notif.type === 'warning' ? 'bg-amber-500/15 text-amber-600' :
                      'bg-surface-container text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {notif.type === 'success' ? 'check_circle' :
                         notif.type === 'error'   ? 'error' :
                         notif.type === 'warning' ? 'warning' :
                         'info'}
                      </span>
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-label-md font-label-bold text-on-surface truncate">{notif.titre}</p>
                        <button
                          onClick={() => supprimerNotification(notif.id)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container flex-shrink-0 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">close</span>
                        </button>
                      </div>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-on-surface-variant">{formatTemps(notif.createdAt)}</span>
                        {(notif.type === 'success' || notif.type === 'warning') && notif.resultatUrl && (
                          <button
                            onClick={() => handleDownload(notif)}
                            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[13px]">download</span>
                            Télécharger
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
};
