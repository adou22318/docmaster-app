import React from 'react';

export const RecentFiles = () => {
  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="font-display-xl text-headline-md">Fichiers Récents</h4>
        <div className="flex gap-2">
          <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="p-2 bg-primary text-on-primary rounded-lg shadow-sm">
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </div>
      
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-widest">Nom du fichier</th>
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-widest">Taille</th>
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              <tr className="hover:bg-surface-container-low/50 transition-all cursor-pointer group">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-600">picture_as_pdf</span>
                    <span className="font-label-bold">DCE_Projet_ZAC_Etoile.pdf</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-on-surface-variant">Aujourd'hui, 09:42</td>
                <td className="px-6 py-6 text-on-surface-variant">42.5 MB</td>
                <td className="px-6 py-6">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-secondary-container/20 rounded-lg text-primary transition-colors"><span className="material-symbols-outlined">download</span></button>
                    <button className="p-2 hover:bg-secondary-container/20 rounded-lg text-primary transition-colors"><span className="material-symbols-outlined">share</span></button>
                    <button className="p-2 hover:bg-error-container text-error rounded-lg transition-colors"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/50 transition-all cursor-pointer group">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600">image</span>
                    <span className="font-label-bold">Facade_Sud_V04.tiff</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-on-surface-variant">Hier, 17:15</td>
                <td className="px-6 py-6 text-on-surface-variant">128.0 MB</td>
                <td className="px-6 py-6">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-secondary-container/20 rounded-lg text-primary transition-colors"><span className="material-symbols-outlined">download</span></button>
                    <button className="p-2 hover:bg-secondary-container/20 rounded-lg text-primary transition-colors"><span className="material-symbols-outlined">share</span></button>
                    <button className="p-2 hover:bg-error-container text-error rounded-lg transition-colors"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
