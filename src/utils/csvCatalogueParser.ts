
import { CatalogueItem } from '../types';
import { parseCSV } from '@/context/imports/csvUtils';

export const parseCatalogueCSV = (csvContent: string): CatalogueItem[] => {
  const { headers, lines } = parseCSV(csvContent);
  const catalogueItems: CatalogueItem[] = [];
  
  // Mapping pour les noms de colonnes du format fourni
  const designationIndex = headers.findIndex(h => h === 'designation');
  const categorieIndex = headers.findIndex(h => h === 'categorie');
  const varianteIndex = headers.findIndex(h => h === 'variante');
  const referenceIndex = headers.findIndex(h => h === 'reference');
  const uniteIndex = headers.findIndex(h => h === 'unite');
  const imageUrlIndex = headers.findIndex(h => h === 'image_url');
  
  if (designationIndex === -1) {
    throw new Error("Format CSV invalide: colonne 'designation' manquante");
  }

  if (referenceIndex === -1) {
    throw new Error("Format CSV invalide: colonne 'reference' manquante");
  }
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const values = line.split(',').map(value => value.trim());
    
    catalogueItems.push({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      designation: values[designationIndex] || '',
      categorie: categorieIndex !== -1 ? values[categorieIndex] : undefined,
      variante: varianteIndex !== -1 ? values[varianteIndex] : undefined,
      reference: referenceIndex !== -1 ? values[referenceIndex] : undefined,
      unite: uniteIndex !== -1 ? values[uniteIndex] : undefined,
      image_url: imageUrlIndex !== -1 ? values[imageUrlIndex] : undefined
    });
  }
  
  return catalogueItems;
};
