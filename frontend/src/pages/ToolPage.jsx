import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { tools } from '../data/tools';
import { useFileStore } from '../store/useFileStore';
import { ToolWorkspaceLayout } from '../components/workspace/ToolWorkspaceLayout';
import { getStatutAbonnement, initierPaiement } from '../services/api/paymentApi.js';

/**
 * Outils réservés aux abonnés Pro.
 * Format : Set de toolIds Pro-only.
 */
const OUTILS_PRO = new Set(['extract_images']);

// ─── Modale Pro-only ──────────────────────────────────────────
const ProGateModal = ({ toolNom, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePasserAuPro = async () => {
    setLoading(true);
    try {
      const res = await initierPaiement();
      window.location.href = res.data.data.paymentUrl;
    } catch (err) {
      // En cas d'erreur, rediriger vers la page tarifs
      navigate('/pricing');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Carte modale */}
      <div className="relative bg-surface rounded-3xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Icône */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
        </div>

        {/* Texte */}
        <div>
          <h2 className="text-lg font-bold text-on-surface mb-2">Outil Pro</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            <strong>{toolNom}</strong> est réservé aux abonnés Pro. Passez au plan Pro pour accéder à cet outil et à tous les avantages exclusifs.
          </p>
        </div>

        {/* Plans comparatif compact */}
        <div className="w-full bg-primary/5 rounded-2xl p-4 text-left">
          <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            Plan Pro — 5 000 XOF / mois
          </p>
          <ul className="space-y-1">
            {['5 Go de stockage', 'Extraction d\'images embarquées', 'Traitements prioritaires', 'Support prioritaire'].map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[13px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-outline-variant text-sm font-semibold text-on-surface-variant hover:border-primary/30 transition-colors">
            Annuler
          </button>
          <button
            onClick={handlePasserAuPro}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-1.5">
            {loading ? (
              <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Redirection…</>
            ) : (
              <><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span> Passer au Pro</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────
export const ToolPage = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();

  const currentFile = useFileStore((state) => state.currentFile);
  const clearCurrentFile = useFileStore((state) => state.clearCurrentFile);

  // Vérification Pro-only
  const [proGateOpen, setProGateOpen] = useState(false);
  const [accesPro, setAccesPro] = useState(null); // null = en cours, true/false = résolu

  const tool = tools.find((t) => t.id === toolId);
  if (!tool) return <Navigate to="/dashboard" replace />;

  const isProTool = OUTILS_PRO.has(toolId);

  // Vérification du statut si c'est un outil Pro
  useEffect(() => {
    if (!isProTool) {
      setAccesPro(true);
      return;
    }
    let cancelled = false;
    getStatutAbonnement()
      .then(res => {
        if (!cancelled) {
          const estPro = res.data.data.statut === 'actif';
          setAccesPro(estPro);
          if (!estPro) setProGateOpen(true);
        }
      })
      .catch(() => {
        if (!cancelled) setAccesPro(true); // En cas d'erreur API, laisser passer (fail-open)
      });
    return () => { cancelled = true; };
  }, [isProTool, toolId]);

  const isCompatible = () => {
    if (!currentFile || !tool.typesAcceptes) return true;
    const fileName = currentFile.nomOriginal || 'doc.pdf';
    const fileExt = '.' + fileName.split('.').pop().toLowerCase();
    return tool.typesAcceptes.extensions.includes(fileExt);
  };

  const [step, setStep] = useState(() => {
    if (!tool.accepteMultiple && currentFile && !tool.sansOptions && isCompatible()) return 'configuration';
    return 'selection';
  });

  useEffect(() => {
    if (step === 'selection' && currentFile && !tool.accepteMultiple && !tool.sansOptions && isCompatible()) {
      setStep('configuration');
    }
  }, [currentFile, step, tool.accepteMultiple, tool.sansOptions]);

  const handleReset = () => {
    clearCurrentFile();
    setStep('selection');
  };

  const handleBack = () => navigate('/dashboard');

  // Affichage pendant la vérification Pro
  if (isProTool && accesPro === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <>
      {/* Modale Pro-only si non abonné */}
      {proGateOpen && (
        <ProGateModal
          toolNom={tool.nom}
          onClose={() => {
            setProGateOpen(false);
            navigate('/dashboard');
          }}
        />
      )}

      <ToolWorkspaceLayout
        tool={tool}
        step={step}
        setStep={setStep}
        onReset={handleReset}
        onBack={handleBack}
      />
    </>
  );
};
