
import React, { useRef, useState } from 'react';
import { Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { readCSVFile, parseCSV, showImportSuccess, showImportError } from '@/context/imports/csvUtils';
import { toast } from '@/components/ui/use-toast';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const CSVImport: React.FC = () => {
  const { loadProductsFromCSV, setProducts, products } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocallyLoaded, setIsLocallyLoaded] = useState(false);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [isSyncingToDb, setIsSyncingToDb] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    setIsLoading(true);
    toast({
      title: "Début du chargement",
      description: "Traitement du fichier CSV en cours...",
    });
    
    readCSVFile(file, (content) => {
      try {
        // Importer localement les produits
        const parsedProducts = parseCSVForLocalImport(content);
        setLocalProducts(parsedProducts);
        setProducts([...products, ...parsedProducts]);
        
        setIsLocallyLoaded(true);
        showImportSuccess(parsedProducts.length, "produits", true);
      } catch (error) {
        console.error("Erreur lors de l'importation locale CSV:", error);
        showImportError(error, true);
      } finally {
        setIsLoading(false);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };
  
  const handleSyncToDatabase = async () => {
    if (localProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucun produit à synchroniser",
        description: "Veuillez d'abord importer un fichier CSV",
      });
      return;
    }
    
    setIsSyncingToDb(true);
    toast({
      title: "Synchronisation avec la base de données",
      description: "Sauvegarde des produits en cours...",
    });
    
    try {
      await loadProductsFromCSV(convertProductsToCSV(localProducts));
      setLocalProducts([]);
      setIsLocallyLoaded(false);
      toast({
        title: "Synchronisation réussie",
        description: "Les produits ont été enregistrés dans la base de données",
      });
    } catch (error) {
      showImportError(error);
    } finally {
      setIsSyncingToDb(false);
    }
  };
  
  // Fonction pour convertir un objet produit en format CSV
  const convertProductsToCSV = (products: Product[]): string => {
    // En-têtes CSV
    const headers = "categorie,designation,variante,reference,unite,image_url";
    
    // Lignes de produits
    const rows = products.map(product => {
      if (product.variants && product.variants.length > 0) {
        // Produit avec variantes
        return product.variants.map(variant => {
          return `${product.category || ""},${product.name},${variant.variantName},${variant.reference},${variant.unit},${product.imageUrl || ""}`;
        }).join('\n');
      } else {
        // Produit sans variante
        return `${product.category || ""},${product.name},,${product.reference || ""},${product.unit || ""},${product.imageUrl || ""}`;
      }
    }).join('\n');
    
    return `${headers}\n${rows}`;
  };
  
  // Fonction pour parser le CSV en objets produits
  const parseCSVForLocalImport = (csvContent: string): Product[] => {
    const { headers, lines } = parseCSV(csvContent);
    const products: Product[] = [];
    
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
    
    // Groupe les produits par designation et categorie
    const productGroups: Map<string, {
      baseProduct: Partial<Product>,
      variants: Array<{variantName: string, reference: string, unit: string}>
    }> = new Map();
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const values = line.split(',').map(value => value.trim());
      
      const designation = values[designationIndex] || '';
      const category = categorieIndex !== -1 ? values[categorieIndex] : '';
      const variant = varianteIndex !== -1 ? values[varianteIndex] : '';
      const reference = referenceIndex !== -1 ? values[referenceIndex] : '';
      const unit = uniteIndex !== -1 ? values[uniteIndex] : '';
      const imageUrl = imageUrlIndex !== -1 ? values[imageUrlIndex] : '';
      
      // Clé unique pour chaque produit (designation + category)
      const productKey = `${designation}-${category}`;
      
      if (!productGroups.has(productKey)) {
        productGroups.set(productKey, {
          baseProduct: {
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: designation,
            category: category || undefined,
            reference: reference || undefined,
            unit: unit || undefined,
            imageUrl: imageUrl || undefined,
          },
          variants: []
        });
      }
      
      // Si une variante est définie, l'ajouter au groupe
      if (variant) {
        const group = productGroups.get(productKey)!;
        group.variants.push({
          variantName: variant,
          reference: reference,
          unit: unit
        });
      }
    }
    
    // Convertir les groupes en produits
    productGroups.forEach((group) => {
      const product: Product = {
        ...group.baseProduct,
        id: group.baseProduct.id!,
        name: group.baseProduct.name!
      };
      
      if (group.variants.length > 0) {
        product.variants = group.variants.map((v, index) => ({
          id: `temp-variant-${Date.now()}-${index}`,
          variantName: v.variantName,
          reference: v.reference,
          unit: v.unit
        }));
      }
      
      products.push(product);
    });
    
    return products;
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importer des produits</CardTitle>
        <CardDescription>
          Chargez un fichier CSV contenant la liste de produits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="space-y-4 w-full">
            <Button 
              onClick={handleButtonClick}
              variant="outline"
              className="w-full flex items-center"
              disabled={isLoading || isSyncingToDb}
            >
              <Upload className="mr-2" size={18} />
              {isLoading ? "Chargement en cours..." : "Charger un fichier CSV"}
            </Button>
            
            {isLocallyLoaded && (
              <Button 
                onClick={handleSyncToDatabase}
                className="w-full flex items-center bg-green-600 hover:bg-green-700"
                disabled={isSyncingToDb}
              >
                <Database className="mr-2" size={18} />
                {isSyncingToDb ? "Synchronisation en cours..." : "Synchroniser avec la base de données"}
              </Button>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>Le fichier CSV doit contenir les colonnes suivantes:</p>
            <p><strong>categorie</strong>, <strong>designation</strong>, <strong>variante</strong>, <strong>reference</strong>, <strong>unite</strong>, <strong>image_url</strong> (optionnel)</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs">
              <p className="font-semibold mb-1">Exemple :</p>
              <p>categorie,designation,variante,reference,unite,image_url</p>
              <p>Raccords,Coude PER à sertir,16,1234A,u,http://exemple.com/coude-per.jpg</p>
              <p>Raccords,Coude PER à sertir,20,1234B,u,http://exemple.com/coude-per.jpg</p>
              <p>Tubes,Tube PER nu,16,5678A,m,http://exemple.com/tube-per.jpg</p>
              <p>Tubes,Tube PER nu,20,5678B,m,http://exemple.com/tube-per.jpg</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVImport;
