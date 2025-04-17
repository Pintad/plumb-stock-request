
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

    if (categorieIndex === -1) {
      throw new Error("Format CSV invalide: colonne 'categorie' manquante");
    }
    
    const productsToInsert: Product[] = [];
    
    // Groupe les produits par designation et categorie
    const productGroups: { [key: string]: { 
      productBase: Product, 
      variants: { variantName: string, reference: string, unit: string }[] 
    }} = {};
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      
      if (values.length > designationIndex) {
        const designation = values[designationIndex];
        const categorie = categorieIndex !== -1 ? values[categorieIndex] : undefined;
        const variante = varianteIndex !== -1 ? values[varianteIndex] : undefined;
        const reference = referenceIndex !== -1 ? values[referenceIndex] : undefined;
        const unite = uniteIndex !== -1 ? values[uniteIndex] : undefined;
        const imageUrl = imageUrlIndex !== -1 && values[imageUrlIndex] ? values[imageUrlIndex] : undefined;
        
        // Clé unique pour chaque produit (designation + categorie)
        const productKey = `${designation}-${categorie || 'uncategorized'}`;
        
        if (!productGroups[productKey]) {
          // Créer un nouveau groupe de produit
          productGroups[productKey] = {
            productBase: {
              id: `product-${Date.now()}-${i}`,
              name: designation,
              category: categorie,
              imageUrl: imageUrl,
              variants: []
            },
            variants: []
          };
        }
        
        // Si une variante est définie, l'ajouter au groupe
        if (variante && reference) {
          productGroups[productKey].variants.push({
            variantName: variante,
            reference: reference,
            unit: unite || ''
          });
        } else {
          // Si pas de variante, mettre les infos directement sur le produit
          productGroups[productKey].productBase.reference = reference;
          productGroups[productKey].productBase.unit = unite;
        }
      }
    }
    
    // Convertir les groupes en produits finaux
    Object.values(productGroups).forEach(group => {
      const product = { ...group.productBase };
      
      // Si le produit a des variants, les ajouter
      if (group.variants.length > 0) {
        product.variants = group.variants.map((v, index) => ({
          id: `variant-${product.id}-${index}`,
          variantName: v.variantName,
          reference: v.reference,
          unit: v.unit
        }));
      }
      
      productsToInsert.push(product);
    });
    
    // Ajouter les produits à l'état local
    setProducts(prev => [...prev, ...productsToInsert]);
    showImportSuccess(productsToInsert.length, "produits");
    
  } catch (error) {
    console.error("Erreur d'importation:", error);
    showImportError(error);
  }
};
