import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const UploadZone = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 mb-16">
      <div 
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={twMerge(
          clsx(
            "border-2 border-dashed border-muted p-16 text-center cursor-pointer transition-colors rounded-sm",
            isDragging ? "bg-surface border-main" : "bg-base hover:bg-surface"
          )
        )}
      >
        <Upload className={clsx("w-12 h-12 mx-auto mb-6", isDragging ? "text-accent" : "text-main")} strokeWidth={1.5} />
        
        <h3 className="text-2xl font-bold text-main mb-2">
          {selectedFile ? selectedFile.name : "Sélectionnez ou glissez un fichier ici"}
        </h3>
        
        <p className="text-muted font-medium">
          {selectedFile 
            ? "Fichier prêt pour le traitement. Sélectionnez un outil ci-dessous." 
            : "PDF, Word, Excel, PPT, JPG, PNG — jusqu'à 50 Mo"}
        </p>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleChange}
          accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
        />
      </div>
    </div>
  );
};
