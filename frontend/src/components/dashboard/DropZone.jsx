import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export const DropZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Process file (e.g., store in Zustand)
      console.log('Fichier déposé:', e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log('Fichier sélectionné:', e.target.files[0]);
    }
  };

  return (
    <section className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-secondary-container/20 to-tertiary-fixed/20 blur-xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div 
        className={`relative bg-surface border-4 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-500 hover:border-secondary shadow-sm min-h-[400px] cursor-pointer ${isDragging ? 'border-secondary bg-secondary-container/5 highlight-zone' : 'border-outline-variant'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="absolute inset-0 dropzone-pattern opacity-5 pointer-events-none"></div>
        <div className="z-10 flex flex-col items-center pointer-events-none">
          <div className="mb-8 p-6 bg-secondary-container/10 rounded-full text-secondary scale-125 transition-transform group-hover:scale-150 duration-700">
            <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'wght' 200" }}>cloud_upload</span>
          </div>
          <h3 className="font-display-xl text-headline-md text-primary mb-4">Glissez vos plans et dossiers techniques</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mb-8">Format PDF, DWG, ou TIFF. Jusqu'à 2GB par fichier. Vos données sont cryptées dès le transfert.</p>
          <div className="flex gap-4 pointer-events-auto">
            <button 
              className="px-8 py-4 bg-primary text-on-primary font-label-bold rounded-lg hover:bg-secondary hover:text-primary transition-all shadow-lg active:scale-95"
              onClick={(e) => {
                e.stopPropagation(); // Evite que le click buble vers la zone DropZone
                handleClick();
              }}
            >
              Parcourir mes fichiers
            </button>
            <button 
              className="px-8 py-4 border-2 border-outline text-primary font-label-bold rounded-lg hover:border-secondary hover:text-secondary transition-all active:scale-95"
              onClick={(e) => { e.stopPropagation(); }}
            >
              Importer via URL
            </button>
          </div>
        </div>
        
        {/* Floating visual accents */}
        <div className="absolute top-10 left-10 opacity-20 group-hover:translate-x-4 transition-transform duration-1000">
          <span className="material-symbols-outlined text-4xl">picture_as_pdf</span>
        </div>
        <div className="absolute bottom-10 right-10 opacity-20 group-hover:-translate-x-4 transition-transform duration-1000">
          <span className="material-symbols-outlined text-4xl">inventory_2</span>
        </div>

        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          className="hidden"
          accept=".pdf,.tiff,.tif"
        />
      </div>
    </section>
  );
};
