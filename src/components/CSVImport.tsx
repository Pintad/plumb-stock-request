
import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { toast } from '@/components/ui/use-toast';

const CSVImport: React.FC = () => {
  const { loadProductsFromCSV } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Vérifier que c'est un fichier CSV
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast({
        variant: "destructive",
        title: "Format de fichier incorrect",
        description: "Veuillez charger un fichier CSV",
      });
      return;
    }
    
    setIsLoading(true);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        loadProductsFromCSV(content);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur de traitement",
          description: "Impossible de traiter le fichier CSV",
        });
      } finally {
        setIsLoading(false);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier",
      });
      setIsLoading(false);
    };
    
    reader.readAsText(file);
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
          <Button 
            onClick={handleButtonClick}
            variant="outline"
            className="w-full flex items-center"
            disabled={isLoading}
          >
            <Upload className="mr-2" size={18} />
            {isLoading ? "Importation..." : "Charger un fichier CSV"}
          </Button>
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>Le fichier CSV doit contenir les colonnes suivantes:</p>
            <p><strong>categorie</strong>, <strong>designation</strong>, <strong>variante</strong>, <strong>reference</strong>, <strong>unite</strong></p>
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs">
              <p className="font-semibold mb-1">Exemple :</p>
              <p>categorie,designation,variante,reference,unite</p>
              <p>Raccords,Coude PER à sertir,16,1234A,u</p>
              <p>Raccords,Coude PER à sertir,20,1234B,u</p>
              <p>Tubes,Tube PER nu,16,5678A,m</p>
              <p>Tubes,Tube PER nu,20,5678B,m</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVImport;
