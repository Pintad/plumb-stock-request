
import { Product, ProductVariant, Project } from '../types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const loadProductsFromCSV = async (
  csvContent: string,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setCategories: React.Dispatch<React.SetStateAction<string[]>>,
  categories: string[]
) => {
  try {
    const lines = csvContent.split('\n');
    if (lines.length <= 1) {
      throw new Error("Le fichier CSV est vide ou mal formaté");
    }
    
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    const nameIndex = headers.findIndex(h => h === 'designation' || h === 'nom' || h === 'name');
    const referenceIndex = headers.findIndex(h => h === 'reference' || h === 'ref');
    const unitIndex = headers.findIndex(h => h === 'unite' || h === 'unit' || h === 'conditionnement');
    const categoryIndex = headers.findIndex(h => h === 'categorie' || h === 'category');
    const variantIndex = headers.findIndex(h => h === 'variante' || h === 'variant' || h === 'dimension');
    const imageUrlIndex = headers.findIndex(h => h === 'image_url' || h === 'imageurl' || h === 'image');
    
    if (nameIndex === -1 || referenceIndex === -1 || unitIndex === -1) {
      throw new Error("Format CSV invalide: colonnes manquantes");
    }
    
    const productGroups = new Map<string, Product>();
    const newCategories = new Set(categories);
    const categoryIds = new Map<string, string>(); // Stockage des ids des catégories
    
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
    
    // Vérifier les catégories et les créer dans Supabase si nécessaires
    for (const category of newCategories) {
      if (!categories.includes(category)) {
        try {
          // Vérifier si la catégorie existe déjà dans Supabase
          const { data, error } = await supabase
            .from('categories')
            .select('id')
            .eq('name', category)
            .maybeSingle(); // Utiliser maybeSingle au lieu de single
          
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
    
    // Insérer les produits dans Supabase
    const supabaseProducts = [];
    const productVariants = [];
    
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
    
    // Mettre à jour l'interface
    setProducts(prev => [...prev, ...supabaseProducts]);
    setCategories([...newCategories].sort());
    
    toast({
      title: "Import réussi",
      description: `${supabaseProducts.length} produits importés avec succès`,
    });
    
  } catch (error) {
    console.error("Erreur d'importation:", error);
    toast({
      variant: "destructive",
      title: "Erreur d'importation",
      description: error instanceof Error ? error.message : "Une erreur est survenue",
    });
  }
};

export const loadProjectsFromCSV = async (
  csvContent: string,
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
) => {
  try {
    const lines = csvContent.split('\n');
    if (lines.length <= 1) {
      throw new Error("Le fichier CSV est vide ou mal formaté");
    }
    
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    const codeIndex = headers.findIndex(h => h === 'code');
    const nameIndex = headers.findIndex(h => h === 'nom' || h === 'name');
    
    if (codeIndex === -1 || nameIndex === -1) {
      throw new Error("Format CSV invalide: colonnes manquantes (code, nom)");
    }
    
    const newProjects: Project[] = [];
    const projectsToInsert = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      
      if (values.length >= Math.max(codeIndex, nameIndex) + 1) {
        const projectCode = values[codeIndex];
        const projectName = values[nameIndex];
        
        projectsToInsert.push({
          code: projectCode,
          name: projectName
        });
      }
    }
    
    // Insérer les projets dans Supabase
    if (projectsToInsert.length > 0) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert(projectsToInsert)
          .select();
        
        if (error) {
          console.error("Erreur lors de l'insertion des projets:", error);
          throw new Error(`Erreur lors de l'insertion des projets: ${error.message}`);
        }
        
        if (data) {
          for (const project of data) {
            newProjects.push({
              id: project.id,
              code: project.code,
              name: project.name
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'insertion des projets:", error);
        throw error;
      }
    }
    
    if (newProjects.length === 0) {
      throw new Error("Aucune affaire valide n'a pu être importée");
    }
    
    setProjects(prev => [...prev, ...newProjects]);
    
    toast({
      title: "Import réussi",
      description: `${newProjects.length} affaires importées avec succès`,
    });
    
  } catch (error) {
    console.error("Erreur d'importation des projets:", error);
    toast({
      variant: "destructive",
      title: "Erreur d'importation",
      description: error instanceof Error ? error.message : "Une erreur est survenue",
    });
  }
};
