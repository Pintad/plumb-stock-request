
import { Product, ProductVariant, Project } from '../types';
import { toast } from '@/components/ui/use-toast';

export const loadProductsFromCSV = (
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
            id: `csv-${i}`,
            name,
            category,
            imageUrl, // Ajout de l'imageUrl au niveau du produit
            variants: [{
              id: `var-${i}`,
              variantName: variant,
              reference,
              unit
            }]
          });
        } else {
          // Produit déjà existant, ajouter une variante
          const existingProduct = productGroups.get(productKey)!;
          
          // Si on a une URL d'image et que le produit n'en a pas encore, on l'ajoute
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
    
    const newProducts = Array.from(productGroups.values());
    
    if (newProducts.length === 0) {
      throw new Error("Aucun produit valide n'a pu être importé");
    }
    
    // Pour les produits avec une seule variante, on simplifie en remontant les informations au niveau du produit
    newProducts.forEach(product => {
      if (product.variants && product.variants.length === 1) {
        product.reference = product.variants[0].reference;
        product.unit = product.variants[0].unit;
        delete product.variants;
      }
    });
    
    setProducts(newProducts);
    setCategories([...newCategories].sort());
    
    toast({
      title: "Import réussi",
      description: `${newProducts.length} produits importés avec succès`,
    });
    
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur d'importation",
      description: error instanceof Error ? error.message : "Une erreur est survenue",
    });
  }
};

export const loadProjectsFromCSV = (
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
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      
      if (values.length >= Math.max(codeIndex, nameIndex) + 1) {
        const project: Project = {
          id: `csv-project-${i}`,
          code: values[codeIndex],
          name: values[nameIndex],
        };
        
        newProjects.push(project);
      }
    }
    
    if (newProjects.length === 0) {
      throw new Error("Aucune affaire valide n'a pu être importée");
    }
    
    setProjects(newProjects);
    
    toast({
      title: "Import réussi",
      description: `${newProjects.length} affaires importées avec succès`,
    });
    
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur d'importation",
      description: error instanceof Error ? error.message : "Une erreur est survenue",
    });
  }
};
