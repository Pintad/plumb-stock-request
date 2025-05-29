
import React from 'react';

interface HighlightedTextProps {
  text: string;
  searchTerms: string[];
  className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, searchTerms, className = "" }) => {
  if (!searchTerms.length || !text) {
    return <span className={className}>{text}</span>;
  }

  // Créer une regex qui capture tous les termes de recherche
  const pattern = new RegExp(`(${searchTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  
  const parts = text.split(pattern);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = searchTerms.some(term => 
          part.toLowerCase() === term.toLowerCase()
        );
        
        return isMatch ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

export default HighlightedText;
