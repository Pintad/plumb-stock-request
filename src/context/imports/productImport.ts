
import { Product } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { parseCSV, showImportSuccess, showImportError } from './csvUtils';

/**
 * Load products from CSV content and store them in Supabase
 */
export const loadProductsFromCSV = async (
  csvContent: string,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setCategories: React.Dispatch<React.SetStateAction<string[]>>,
  categories: string[]
) => {
  try {
    const { headers, lines } = parseCSV(csvContent);
    
    const nameIndex = headers.findIndex(h => h === 'designation' || h === 'nom' || h === 'name');
    const referenceIndex = headers.findIndex(h => h === 'reference' || h === 'ref');
    const unitIndex = headers.findIndex(h => h === 'unite' || h === 'unit' || h === 'conditionnement');
    const categoryIndex = headers.findIndex(h => h === 'categorie' || h === 'category');
    const variantIndex = headers.findIndex(h => h === 'variante' || h === 'variant' || h === 'dimension');
    const imageUrlIndex = headers.findIndex(h => h === 'image_url' || h === 'imageurl' || h === 'image');
    
    if (nameIndex === -1 || referenceIndex === -1 || unitIndex === -1) {
      throw new Error("Format CSV invalide: colonnes manquantes");
    }
    
    const { productGroups, newCategories } = groupProductsAndCategories(
      lines,
      nameIndex,
      referenceIndex,
      unitIndex,
      categoryIndex,
      variantIndex,
      imageUrlIndex
    );
    
    const categoryIds = await processCategoriesInSupabase(newCategories, categories);
    const supabaseProducts = await insertProductsIntoSupabase(productGroups, categoryIds);
    
    // Mettre à jour l'interface
    setProducts(prev => [...prev, ...supabaseProducts]);
    setCategories([...newCategories].sort());
    
    showImportSuccess(supabaseProducts.length, "produits");
    
  } catch (error) {
    showImportError(error);
  }
};

/**
 * Group products and collect categories from CSV lines
 */
const groupProductsAndCategories = (
  lines: string[],
  nameIndex: number,
  referenceIndex: number,
  unitIndex: number,
  categoryIndex: number,
  variantIndex: number,
  imageUrlIndex: number
) => {
  const productGroups = new Map<string, Product>();
  const newCategories = new Set<string>();
  
  // Première passe: regrouper les produits et préparer les catégories
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(value => value.trim());
    
    if (values.length >= Math.max(nameIndex, referenceIndex, unitIndex) + 1) {
      const category = categoryIndex !== -1 && values[categoryIndex] ? values[categoryIndex] : undefined;
      const name = values[nameIndex];
      const reference = values[referenceIndex];
      const unit = values[unitIndex];
      const variant = variantIndex !== -1 && values[variantIndex] ? values[variantIndex] : reference;
      const imageUrl = imageUrlIndex !== -1 && values[imageUrlIndex] ? values[imageUrlIndex] : undefined;
      
      if (category) {
        newCategories.add(category);
      }
      
      // Créer une clé unique pour regrouper les produits ayant la même désignation et catégorie
      const productKey = `${name}${category || ''}`;
      
      if (!productGroups.has(productKey)) {
        // Premier produit de ce groupe
        productGroups.set(productKey, {
          id: `csv-${i}`, // Temporaire, sera remplacé par l'ID Supabase
          name,
          category,
          imageUrl,
          variants: [{
            id: `var-${i}`, // Temporaire
            variantName: variant,
            reference,
            unit
          }]
        });
      } else {
        // Produit déjà existant, ajouter une variante
        const existingProduct = productGroups.get(productKey)!;
        
        if (imageUrl && !existingProduct.imageUrl) {
          existingProduct.imageUrl = imageUrl;
        }
        
        existingProduct.variants!.push({
          id: `var-${i}`,
          variantName: variant,
          reference,
          unit
        });
      }
    }
  }
  
  return { productGroups, newCategories };
};

/**
 * Process categories in Supabase - check if they exist and create if needed
 */
const processCategoriesInSupabase = async (
  newCategories: Set<string>,
  existingCategories: string[]
) => {
  const categoryIds = new Map<string, string>();
  
  for (const category of newCategories) {
    if (!existingCategories.includes(category)) {
      try {
        // Vérifier si la catégorie existe déjà dans Supabase
        const { data, error } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
          console.error(`Erreur lors de la vérification de la catégorie ${category}:`, error);
          continue;
        }
        
        if (data) {
          // La catégorie existe déjà
          categoryIds.set(category, data.id);
        } else {
          // Créer la catégorie
          const { data: newCategory, error: insertError } = await supabase
            .from('categories')
            .insert({ name: category })
            .select()
            .single();
          
          if (insertError) {
            console.error(`Erreur lors de la création de la catégorie ${category}:`, insertError);
            continue;
          }
          
          categoryIds.set(category, newCategory.id);
        }
      } catch (error) {
        console.error(`Erreur lors de la gestion de la catégorie ${category}:`, error);
      }
    }
  }
  
  return categoryIds;
};

/**
 * Insert products into Supabase database
 */
const insertProductsIntoSupabase = async (
  productGroups: Map<string, Product>,
  categoryIds: Map<string, string>
) => {
  const supabaseProducts: Product[] = [];
  const productVariants: any[] = [];
  
  for (const product of productGroups.values()) {
    try {
      // Pour les produits avec une seule variante, on simplifie
      if (product.variants && product.variants.length === 1) {
        product.reference = product.variants[0].reference;
        product.unit = product.variants[0].unit;
      }
      
      // Déterminer l'ID de catégorie
      let categoryId = null;
      if (product.category && categoryIds.has(product.category)) {
        categoryId = categoryIds.get(product.category);
      }
      
      // Préparer le produit pour l'insertion
      const productToInsert = {
        name: product.name,
        reference: product.reference || null,
        unit: product.unit || null,
        category_id: categoryId,
        image_url: product.imageUrl || null
      };
      
      // Insérer le produit
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert(productToInsert)
        .select()
        .single();
      
      if (productError) {
        console.error(`Erreur lors de l'insertion du produit ${product.name}:`, productError);
        continue;
      }
      
      // Mettre à jour l'ID du produit
      product.id = insertedProduct.id;
      supabaseProducts.push(product);
      
      // Insérer les variantes si nécessaire (uniquement pour les produits avec plusieurs variantes)
      if (product.variants && product.variants.length > 1) {
        for (const variant of product.variants) {
          const variantToInsert = {
            product_id: insertedProduct.id,
            variant_name: variant.variantName,
            reference: variant.reference,
            unit: variant.unit
          };
          
          productVariants.push(variantToInsert);
        }
      }
    } catch (error) {
      console.error(`Erreur lors de l'insertion du produit:`, error);
    }
  }
  
  // Insérer toutes les variantes en une fois
  if (productVariants.length > 0) {
    try {
      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(productVariants);
      
      if (variantsError) {
        console.error("Erreur lors de l'insertion des variantes:", variantsError);
      }
    } catch (error) {
      console.error("Erreur lors de l'insertion des variantes:", error);
    }
  }
  
  return supabaseProducts;
};
