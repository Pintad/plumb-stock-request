
import React, { useRef, useState } from 'react';
import { Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { readCSVFile, parseCSV, showImportSuccess, showImportError } from '@/context/imports/csvUtils';
import { toast } from '@/components/ui/use-toast';
import { Product, CatalogueItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const CSVImport: React.FC = () => {
  const { loadProductsFromCSV, setProducts, products } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocallyLoaded, setIsLocallyLoaded] = useState(false);
  const [localCatalogueItems, setLocalCatalogueItems] = useState<CatalogueItem[]>([]);
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
        // Importer localement les produits du catalogue
        const parsedItems = parseCSVForCatalogueImport(content);
        setLocalCatalogueItems(parsedItems);
        
        // Convertir les éléments du catalogue en produits pour l'affichage local
        const productMap = new Map<string, Product>();
        const variantMap = new Map<string, Map<string, any>>();
        
        // Traiter d'abord les éléments sans variante
        parsedItems.filter(item => !item.variante).forEach(item => {
          productMap.set(item.designation, {
            id: item.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.designation,
            reference: item.reference || undefined,
            unit: item.unite || undefined,
            category: item.categorie || undefined,
            imageUrl: item.image_url || undefined,
            variants: []
          });
        });
        
        // Traiter ensuite les variantes
        parsedItems.filter(item => item.variante).forEach(item => {
          if (!variantMap.has(item.designation)) {
            variantMap.set(item.designation, new Map());
          }
          
          const productVariants = variantMap.get(item.designation)!;
          
          productVariants.set(item.variante!, {
            id: `temp-${Date.now()}-${item.variante}-${Math.random().toString(36).substr(2, 9)}`,
            variantName: item.variante!,
            reference: item.reference || '',
            unit: item.unite || ''
          });
          
          // Créer ou mettre à jour le produit
          if (!productMap.has(item.designation)) {
            productMap.set(item.designation, {
              id: item.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        
        const newProducts = Array.from(productMap.values());
        setProducts([...products, ...newProducts]);
        
        setIsLocallyLoaded(true);
        showImportSuccess(parsedItems.length, "produits", true);
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
    if (localCatalogueItems.length === 0) {
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
      // Insérer directement dans la table catalogue
      const { data, error } = await supabase
        .from('catalogue')
        .insert(localCatalogueItems.map(item => ({
          designation: item.designation,
          reference: item.reference || null,
          unite: item.unite || null,
          categorie: item.categorie || null,
          image_url: item.image_url || null,
          variante: item.variante || null
        })));
      
      if (error) throw error;
      
      setLocalCatalogueItems([]);
      setIsLocallyLoaded(false);
      
      // Rafraîchir la liste des produits
      const { data: catalogueItems } = await supabase
        .from('catalogue')
        .select('*');
        
      if (catalogueItems) {
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
        setProducts(formattedProducts);
      }
      
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
  
  // Fonction pour parser le CSV en éléments du catalogue
  const parseCSVForCatalogueImport = (csvContent: string): CatalogueItem[] => {
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
