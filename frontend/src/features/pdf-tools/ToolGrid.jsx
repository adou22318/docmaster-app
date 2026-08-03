import React from 'react';
import { ToolCard } from './ToolCard';

// Base de données statique des outils (selon le mockup)
const toolsData = [
  // Conversion
  { name: "PDF → Word", desc: "Conversion précise avec mise en page", iconName: "FileText", cat: "convert" },
  { name: "PDF → Excel", desc: "Extrait tableaux et données", iconName: "Sheet", cat: "convert" },
  { name: "PDF → PPT", desc: "Transforme en présentation", iconName: "Presentation", cat: "convert" },
  { name: "Word → PDF", desc: "DOCX vers PDF haute fidélité", iconName: "FileText", cat: "convert" },
  { name: "Excel → PDF", desc: "Conserve les formules / graphiques", iconName: "Sheet", cat: "convert" },
  { name: "JPG → PDF", desc: "Images groupées en PDF unique", iconName: "Image", cat: "convert" },
  { name: "PDF → JPG", desc: "Export pages en HD", iconName: "Camera", cat: "convert" },
  // Édition & Annotation
  { name: "Éditeur PDF", desc: "Texte, images, formes", iconName: "PenSquare", cat: "edit" },
  { name: "Annoter & surligner", desc: "Commentaires, dessins", iconName: "Highlighter", cat: "edit" },
  { name: "Ajouter filigrane", desc: "Texte / image personnalisé", iconName: "Stamp", cat: "edit" },
  { name: "Remplir formulaire", desc: "Champs interactifs", iconName: "CheckSquare", cat: "edit" },
  // Organisation
  { name: "Fusionner PDF", desc: "Assemble plusieurs fichiers", iconName: "Merge", cat: "organize" },
  { name: "Diviser PDF", desc: "Extrait pages ou intervalle", iconName: "Scissors", cat: "organize" },
  { name: "Réorganiser pages", desc: "Glisser-déposer, rotation", iconName: "ArrowLeftRight", cat: "organize" },
  { name: "Rotation PDF", desc: "Pivote toutes les pages", iconName: "RotateCw", cat: "organize" },
  { name: "Supprimer pages", desc: "Supprimez des pages spécifiques", iconName: "Trash2", cat: "organize" },
  { name: "Compresser PDF", desc: "Réduit taille sans perte", iconName: "Archive", cat: "organize" },
  // sécurité & signature
  { name: "Signer PDF", desc: "Signature électronique légale", iconName: "PenTool", cat: "security" },
  { name: "Demander signature", desc: "Envoi multi-signatures", iconName: "Mail", cat: "security" },
  { name: "Protéger par mot de passe", desc: "Chiffrement AES 256", iconName: "Lock", cat: "security" },
  { name: "Certificat ISO 27001", desc: "Conformité RGPD", iconName: "Shield", cat: "security" },
  // productivité & OCR
  { name: "OCR Texte", desc: "Reconnaissance sur scan", iconName: "ScanText", cat: "productivity" },
  { name: "Traitement par lots", desc: "50 fichiers en une fois", iconName: "Layers", cat: "productivity" },
  { name: "Stockage Cloud", desc: "1 Go gratuit, synchronisation", iconName: "Cloud", cat: "productivity" },
  { name: "Extension navigateur", desc: "Web → PDF", iconName: "Globe", cat: "productivity" },
  { name: "Comparer PDF", desc: "Diff visuelle", iconName: "FileDiff", cat: "productivity" },
];

export const ToolGrid = ({ currentFilter }) => {
  const filteredTools = currentFilter === 'all' 
    ? toolsData 
    : toolsData.filter(tool => tool.cat === currentFilter);

  const handleToolClick = (toolName) => {
    alert(`Outil sélectionné : ${toolName}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool, idx) => (
          <ToolCard 
            key={idx}
            name={tool.name}
            desc={tool.desc}
            iconName={tool.iconName}
            onClick={() => handleToolClick(tool.name)}
          />
        ))}
      </div>
    </div>
  );
};
