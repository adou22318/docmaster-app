import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import axiosClient from '../services/api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export const SettingsPage = () => {
  const { user, loginUser, logoutUser } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nom_complet: user?.nom_complet || '',
    email: user?.email || '',
    newPassword: ''
  });

  // Les comptes OAuth Google ont généralement une photo_url définie
  const isGoogleAuth = !!user?.photo_url;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (isGoogleAuth) return;
    try {
      setIsSaving(true);
      const response = await axiosClient.put('/auth/profile', formData);
      if (response.data.success) {
        toast.success(response.data.message);
        // Mettre à jour l'utilisateur dans le store
        loginUser({ ...user, ...response.data.data }, null); // Le token ne change pas
        setIsEditing(false);
        setFormData({ ...formData, newPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await axiosClient.delete('/auth/account');
      await logoutUser();
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte. Réessayez.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header de page */}
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
              <span className="material-symbols-outlined text-[18px] text-on-secondary-container">settings</span>
            </div>
            <span className="font-label-bold text-label-lg text-on-surface">Paramètres</span>
          </div>
        </div>
      </div>
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-8 py-12 space-y-12">
        <div>
          <h1 className="font-display-xl text-headline-md text-primary mb-2">Paramètres de compte</h1>
          <p className="text-on-surface-variant">Gérez vos informations personnelles et vos préférences de sécurité.</p>
        </div>

        {/* Section Profil */}
        <section className="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant relative">
          <h2 className="font-label-bold text-label-lg text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">person</span>
            Mon Profil
          </h2>
          {!isGoogleAuth && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-6 right-6 p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
              title={isEditing ? 'Annuler' : 'Modifier'}
            >
              <span className="material-symbols-outlined">{isEditing ? 'close' : 'edit'}</span>
            </button>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-secondary-container text-primary flex items-center justify-center overflow-hidden flex-shrink-0 border border-outline-variant">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[40px]">person</span>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div>
                    <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Nom complet</label>
                    <input 
                      type="text" 
                      value={formData.nom_complet}
                      onChange={(e) => setFormData({...formData, nom_complet: e.target.value})}
                      className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-xl px-4 py-2 text-body-md text-on-surface outline-none transition-colors"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-label-bold text-body-lg text-primary">{user?.nom_complet || 'Utilisateur'}</p>
                    <p className="text-on-surface-variant text-body-sm bg-surface-container-high inline-block px-3 py-1 rounded-full mt-2">Plan {user?.plan || 'Gratuit'}</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-outline-variant/50">
              <div>
                <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Adresse Email</label>
                <input 
                  type="email" 
                  value={isEditing ? formData.email : (user?.email || '')}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full border border-outline-variant rounded-xl px-4 py-3 text-body-md text-on-surface outline-none transition-colors ${isEditing ? 'bg-surface-container-lowest focus:border-primary' : 'bg-surface-container-low opacity-70 cursor-not-allowed'}`}
                  required
                />
              </div>
              
              {!isGoogleAuth && isEditing && (
                <div>
                  <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Nouveau mot de passe (optionnel)</label>
                  <input 
                    type="password" 
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="Laisser vide pour ne pas modifier"
                    minLength={8}
                    className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-xl px-4 py-3 text-body-md text-on-surface outline-none transition-colors"
                  />
                </div>
              )}

              {isEditing && (
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-bold hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {isSaving && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                    Enregistrer les modifications
                  </button>
                </div>
              )}

              {isGoogleAuth && (
                <p className="text-label-sm text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Votre compte est lié à Google. Vos informations de profil sont gérées par Google.
                </p>
              )}
            </div>
          </form>
        </section>

        {/* Section Zone Dangereuse */}
        <section className="bg-error/5 rounded-3xl p-6 md:p-8 border border-error/20 mt-12">
          <h2 className="font-label-bold text-label-lg text-error mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            Zone Dangereuse
          </h2>
          <p className="text-on-surface-variant text-body-sm mb-6 max-w-xl">
            La suppression de votre compte est définitive. Toutes vos données, y compris vos fichiers stockés et votre historique, seront immédiatement et irréversiblement effacées de nos serveurs.
          </p>

          {!showConfirm ? (
            <button 
              onClick={() => setShowConfirm(true)}
              className="px-6 py-3 bg-error text-on-error rounded-xl font-label-bold hover:bg-error/90 transition-colors"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="bg-surface rounded-2xl p-6 border border-error/30">
              <p className="font-label-bold text-primary mb-4">Êtes-vous absolument certain ?</p>
              <div className="flex gap-4">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-error text-on-error rounded-xl font-label-bold hover:bg-error/90 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Suppression...' : 'Oui, supprimer définitivement'}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-surface-container text-on-surface-variant rounded-xl font-label-bold hover:text-primary transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
