
import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { readCSVFile } from '@/context/imports/csvUtils';

const ProjectCSVImport: React.FC = () => {
  const { loadProjectsFromCSV } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    setIsLoading(true);
    
    readCSVFile(file, (content) => {
      try {
        loadProjectsFromCSV(content);
      } finally {
        setIsLoading(false);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importer des affaires</CardTitle>
        <CardDescription>
          Chargez un fichier CSV contenant la liste des affaires
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
            <p><strong>code</strong>, <strong>nom</strong></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCSVImport;
