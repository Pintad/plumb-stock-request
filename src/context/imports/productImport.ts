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
    
    const catalogueItemsToInsert: { 
      designation: string;
      categorie?: string;
      reference?: string;
      unite?: string;
      image_url?: string;
      variante?: string;
    }[] = [];
    
    // Préparer les éléments à insérer dans la table catalogue
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      
      if (values.length > designationIndex) {
        catalogueItemsToInsert.push({
          designation: values[designationIndex],
          categorie: categorieIndex !== -1 ? values[categorieIndex] : undefined,
          reference: referenceIndex !== -1 ? values[referenceIndex] : undefined,
          unite: uniteIndex !== -1 ? values[uniteIndex] : undefined,
          image_url: imageUrlIndex !== -1 && values[imageUrlIndex] ? values[imageUrlIndex] : undefined,
          variante: varianteIndex !== -1 ? values[varianteIndex] : undefined
        });
      }
    }
    
    if (catalogueItemsToInsert.length === 0) {
      throw new Error("Aucun produit valide n'a pu être extrait du fichier CSV");
    }
    
    // Insérer directement dans la table catalogue
    const { data: insertedItems, error } = await supabase
      .from('catalogue')
      .insert(catalogueItemsToInsert)
      .select();
    
    if (error) {
      throw error;
    }
    
    // Mise à jour du state avec les produits formatés
    await refreshProductList(setProducts);
    
    showImportSuccess(insertedItems.length, "produits");
    
  } catch (error) {
    console.error("Erreur d'importation:", error);
    showImportError(error);
  }
};

/**
 * Rafraîchit la liste des produits depuis Supabase
 */
export const refreshProductList = async (
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    // Récupérer tous les éléments du catalogue
    const { data: catalogueItems, error: fetchError } = await supabase
      .from('catalogue')
      .select('*');
    
    if (fetchError) {
      console.error("Erreur lors de la récupération du catalogue:", fetchError);
      throw new Error("Erreur lors de la récupération des produits");
    }
    
    if (!catalogueItems || catalogueItems.length === 0) {
      console.warn("Aucun produit n'a été trouvé dans le catalogue");
      setProducts([]);
      return [];
    }
    
    // Convertir les éléments du catalogue en produits
    const productMap = new Map<string, Product>();
    const variantMap = new Map<string, Map<string, any>>();
    
    // Traiter d'abord les éléments sans variante
    catalogueItems.filter(item => !item.variante).forEach(item => {
      productMap.set(item.designation, {
        id: item.id,
        name: item.designation,
        reference: item.reference || undefined,
        unit: item.unite || undefined,
        category: item.categorie || undefined,
        imageUrl: item.image_url || undefined,
        variants: []
      });
    });
    
    // Traiter ensuite les variantes
    catalogueItems.filter(item => item.variante).forEach(item => {
      if (!variantMap.has(item.designation)) {
        variantMap.set(item.designation, new Map());
      }
      
      const productVariants = variantMap.get(item.designation)!;
      
      productVariants.set(item.variante!, {
        id: `${item.id}-${item.variante}`,
        variantName: item.variante!,
        reference: item.reference || '',
        unit: item.unite || ''
      });
      
      // Créer ou mettre à jour le produit
      if (!productMap.has(item.designation)) {
        productMap.set(item.designation, {
          id: item.id,
          name: item.designation,
          category: item.categorie || undefined,
          imageUrl: item.image_url || undefined,
          variants: []
        });
      }
    });
    
    // Ajouter les variantes aux produits
    for (const [designation, variants] of variantMap.entries()) {
      if (productMap.has(designation)) {
        const product = productMap.get(designation)!;
        product.variants = Array.from(variants.values());
      }
    }
    
    const formattedProducts = Array.from(productMap.values());
    
    // Mettre à jour l'état avec tous les produits
    setProducts(formattedProducts);
    
    return formattedProducts;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement de la liste des produits:", error);
    throw error;
  }
};

/**
 * Insert products into Supabase database - Cette fonction n'est plus utilisée directement
 * car les produits sont maintenant insérés via la table catalogue
 * Le code est conservé à titre de référence
 */
const insertProductsIntoSupabase = async (
  productsToInsert: { 
    name: string;
    category?: string;
    reference?: string;
    unit?: string;
    image_url?: string;
    variants?: Array<{
      variantName: string;
      reference: string;
      unit: string;
    }>;
  }[]
) => {
  const insertedProducts = [];
  
  for (const productData of productsToInsert) {
    try {
      // Vérifier si la catégorie existe déjà ou doit être créée
      let categoryId = null;
      if (productData.category) {
        try {
          const { data: existingCategory } = await supabase
            .from('categories')
            .select('id')
            .eq('name', productData.category)
            .maybeSingle();
          
          if (existingCategory) {
            categoryId = existingCategory.id;
          } else {
            const { data: newCategory, error: categoryError } = await supabase
              .from('categories')
              .insert({ name: productData.category })
              .select()
              .single();
            
            if (categoryError) {
              console.error("Erreur lors de la création de la catégorie:", categoryError);
              continue;
            }
            
            categoryId = newCategory.id;
          }
        } catch (categoryError) {
          console.error("Erreur lors de la vérification/création de la catégorie:", categoryError);
          // Continuer sans catégorie en cas d'erreur
        }
      }
      
      // Insérer le produit
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          reference: productData.reference || null,
          unit: productData.unit || null,
          category_id: categoryId,
          image_url: productData.image_url || null
        })
        .select()
        .single();
      
      if (productError) {
        console.error("Erreur lors de l'insertion du produit:", productError);
        continue;
      }
      
      // Insérer les variantes si présentes
      if (productData.variants && productData.variants.length > 0 && insertedProduct) {
        const variantsToInsert = productData.variants.map(variant => ({
          product_id: insertedProduct.id,
          variant_name: variant.variantName,
          reference: variant.reference,
          unit: variant.unit
        }));
        
        try {
          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantsToInsert);
          
          if (variantError) {
            console.error("Erreur lors de l'insertion des variantes:", variantError);
            // On continue même en cas d'erreur pour les variantes
          }
        } catch (variantError) {
          console.error("Exception lors de l'insertion des variantes:", variantError);
        }
      }
      
      insertedProducts.push(insertedProduct);
      
    } catch (error) {
      console.error("Erreur lors de l'insertion du produit:", error);
      // Continuer avec le produit suivant en cas d'erreur
    }
  }
  
  return insertedProducts;
};
