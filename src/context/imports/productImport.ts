
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
    
    const productsToInsert: { 
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
    }[] = [];
    
    // Groupe les produits par designation et categorie
    const productGroups: { [key: string]: { 
      productBase: {
        name: string;
        category?: string;
        reference?: string;
        unit?: string;
        image_url?: string;
      }, 
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
              name: designation,
              category: categorie,
              reference: reference,
              unit: unite,
              image_url: imageUrl,
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
        }
      }
    }
    
    // Convertir les groupes en produits à insérer
    Object.values(productGroups).forEach(group => {
      const product = { ...group.productBase };
      
      // Préparer l'objet pour insertion dans Supabase
      productsToInsert.push({
        name: product.name,
        category: product.category,
        reference: group.variants.length === 0 ? product.reference : undefined,
        unit: group.variants.length === 0 ? product.unit : undefined,
        image_url: product.image_url,
        variants: group.variants.length > 0 ? group.variants : undefined
      });
    });
    
    if (productsToInsert.length === 0) {
      throw new Error("Aucun produit valide n'a pu être extrait du fichier CSV");
    }
    
    // Insérer les produits dans Supabase et récupérer les nouveaux produits
    const newProducts = await insertProductsIntoSupabase(productsToInsert);
    
    // Récupérer tous les produits de Supabase pour mettre à jour le state
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('*, product_variants(*)');
    
    if (fetchError) {
      console.error("Erreur lors de la récupération des produits:", fetchError);
      throw new Error("Erreur lors de la récupération des produits");
    }
    
    if (allProducts) {
      // Formater les produits pour le state
      const formattedProducts: Product[] = allProducts.map(product => {
        const variants = product.product_variants 
          ? product.product_variants.map((variant: any) => ({
              id: variant.id,
              variantName: variant.variant_name,
              reference: variant.reference,
              unit: variant.unit
            }))
          : undefined;
        
        return {
          id: product.id,
          name: product.name,
          reference: product.reference || undefined,
          unit: product.unit || undefined,
          category: product.category_id ? undefined : undefined, // Sera mis à jour ci-dessous
          imageUrl: product.image_url || undefined,
          variants: variants && variants.length > 0 ? variants : undefined
        };
      });
      
      // Récupérer les catégories pour compléter les produits
      const productsWithCategoryIds = allProducts.filter((p: any) => p.category_id);
      if (productsWithCategoryIds.length > 0) {
        const categoryIds = [...new Set(productsWithCategoryIds.map((p: any) => p.category_id))];
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('id, name');
          
        if (!catError && categoriesData) {
          const categoryMap = new Map(categoriesData.map((cat: any) => [cat.id, cat.name]));
          for (let i = 0; i < formattedProducts.length; i++) {
            const originalProduct = allProducts[i];
            if (originalProduct?.category_id) {
              formattedProducts[i].category = categoryMap.get(originalProduct.category_id) || undefined;
            }
          }
        }
      }
      
      // Mettre à jour l'état avec tous les produits
      setProducts(formattedProducts);
    }
    
    showImportSuccess(newProducts.length, "produits");
    
  } catch (error) {
    console.error("Erreur d'importation:", error);
    showImportError(error);
  }
};

/**
 * Insert products into Supabase database
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
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', productData.category)
          .single();
        
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
        
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);
        
        if (variantError) {
          console.error("Erreur lors de l'insertion des variantes:", variantError);
          // On continue même en cas d'erreur pour les variantes
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
