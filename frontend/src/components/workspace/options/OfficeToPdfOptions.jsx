import React, { useState } from 'react';

export const OfficeToPdfOptions = ({ onStart, isProcessing }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onStart({});
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="font-display-xl text-title-md text-on-surface">Convertir en PDF</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Votre document Office sera converti en PDF haute qualité.
        </p>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="p-4 bg-surface-container rounded-xl space-y-3">
          <p className="text-label-md font-label-bold text-on-surface">Formats pris en charge</p>
          {[
            { icon: 'description', label: 'Word', formats: '.doc, .docx' },
            { icon: 'table_chart', label: 'Excel', formats: '.xls, .xlsx' },
            { icon: 'slideshow', label: 'PowerPoint', formats: '.ppt, .pptx' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{f.icon}</span>
              <div>
                <span className="text-label-sm font-label-bold text-on-surface">{f.label} </span>
                <span className="text-label-sm text-on-surface-variant">{f.formats}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 p-4 bg-secondary-container/30 rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">info</span>
          <p className="text-body-sm text-on-surface-variant">
            La mise en page et la mise en forme seront préservées au maximum.
          </p>
        </div>
      </div>

      <div className="p-6 border-t border-outline-variant bg-surface">
        <button
          onClick={handleSubmit}
          disabled={isProcessing || loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-label-bold text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Lancement…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              Convertir en PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};
