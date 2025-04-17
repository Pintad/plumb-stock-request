import { Product } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { parseCSV, showImportSuccess, showImportError } from './csvUtils';

/**
 * Load products from CSV content and store them in Supabase
 */
export const loadProductsFromCSV = async (
  csvContent: string,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    const { headers, lines } = parseCSV(csvContent);
    
    const nameIndex = headers.findIndex(h => h === 'name');
    const referenceIndex = headers.findIndex(h => h === 'reference');
    const unitIndex = headers.findIndex(h => h === 'unit');
    const categoryIndex = headers.findIndex(h => h === 'category');
    const imageUrlIndex = headers.findIndex(h => h === 'imageUrl');
    
    if (nameIndex === -1) {
      throw new Error("Format CSV invalide: colonne 'name' manquante");
    }
    
    const productsToInsert: Product[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      
      if (values.length > nameIndex) {
        const product: Product = {
          id: `product-${Date.now()}-${i}`,
          name: values[nameIndex],
          reference: referenceIndex !== -1 ? values[referenceIndex] : undefined,
          unit: unitIndex !== -1 ? values[unitIndex] : undefined,
          category: categoryIndex !== -1 ? values[categoryIndex] : undefined,
          imageUrl: imageUrlIndex !== -1 ? values[imageUrlIndex] : undefined,
        };
        productsToInsert.push(product);
      }
    }
    
    setProducts(prev => [...prev, ...productsToInsert]);
    showImportSuccess(productsToInsert.length, "produits");
    
  } catch (error) {
    showImportError(error);
  }
};
