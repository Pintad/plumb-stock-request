
import { Product, CatalogueItem } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { convertCatalogueToProducts } from '@/utils/catalogueConverter';

/**
 * Ajoute un produit à la base de données Supabase (table catalogue)
 */
export const addProductToSupabase = async (product: Product): Promise<boolean> => {
  try {
    // Si le produit a des variantes
    if (product.variants && product.variants.length > 0) {
      // Insérer chaque variante comme une entrée distincte dans le catalogue
      const catalogueItems = product.variants.map(variant => ({
        designation: product.name,
        reference: variant.reference,
        unite: variant.unit,
        categorie: product.category,
        image_url: product.imageUrl,
        variante: variant.variantName,
        keywords: product.keywords
      }));
      
      const { error } = await supabase
        .from('catalogue')
        .insert(catalogueItems);
      
      if (error) throw error;
    } else {
      // Insérer le produit principal sans variante
      const { error } = await supabase
        .from('catalogue')
        .insert({
          designation: product.name,
          reference: product.reference,
          unite: product.unit,
          categorie: product.category,
          image_url: product.imageUrl,
          keywords: product.keywords
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    return false;
  }
};

/**
 * Met à jour un produit dans la base de données Supabase (table catalogue)
 */
export const updateProductInSupabase = async (product: Product): Promise<boolean> => {
  try {
    // Supprimer toutes les entrées existantes pour ce produit
    const { error: deleteError } = await supabase
      .from('catalogue')
      .delete()
      .eq('id', product.id);
    
    if (deleteError) {
      // Si l'ID spécifique n'a pas été trouvé, essayons de supprimer par désignation
      const { error: deleteByNameError } = await supabase
        .from('catalogue')
        .delete()
        .eq('designation', product.name);
      
      if (deleteByNameError) throw deleteByNameError;
    }
    
    // Réinsérer le produit avec ses nouvelles données
    if (product.variants && product.variants.length > 0) {
      // Insérer chaque variante
      const catalogueItems = product.variants.map(variant => ({
        designation: product.name,
        reference: variant.reference,
        unite: variant.unit,
        categorie: product.category,
        image_url: product.imageUrl,
        variante: variant.variantName,
        keywords: product.keywords
      }));
      
      const { error } = await supabase
        .from('catalogue')
        .insert(catalogueItems);
      
      if (error) throw error;
    } else {
      // Insérer le produit principal sans variante
      const { error } = await supabase
        .from('catalogue')
        .insert({
          designation: product.name,
          reference: product.reference,
          unite: product.unit,
          categorie: product.category,
          image_url: product.imageUrl,
          keywords: product.keywords
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return false;
  }
};

/**
 * Supprime un produit de la base de données Supabase (table catalogue)
 */
export const deleteProductFromSupabase = async (productId: string): Promise<boolean> => {
  try {
    // Récupérer le produit pour obtenir son nom
    const { data: productData } = await supabase
      .from('catalogue')
      .select('designation')
      .eq('id', productId)
      .maybeSingle();
    
    if (productData && productData.designation) {
      // Supprimer toutes les entrées avec cette désignation (produit principal et ses variantes)
      const { error } = await supabase
        .from('catalogue')
        .delete()
        .eq('designation', productData.designation);
      
      if (error) throw error;
    } else {
      // Si on ne trouve pas le produit par ID, on tente juste de supprimer cet ID
      const { error } = await supabase
        .from('catalogue')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return false;
  }
};

/**
 * Récupère tous les produits depuis la table catalogue
 */
export const fetchAllProducts = async (): Promise<Product[]> => {
  try {
    const { data: catalogueData, error } = await supabase
      .from('catalogue')
      .select('*');
    
    if (error) throw error;
    
    if (!catalogueData || catalogueData.length === 0) {
      return [];
    }
    
    const products = convertCatalogueToProducts(catalogueData);
    return products;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return [];
  }
};
