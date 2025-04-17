
import React, { useRef, useState } from 'react';
import { Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { readCSVFile, parseCSV, showImportSuccess, showImportError } from '@/context/imports/csvUtils';
import { toast } from '@/components/ui/use-toast';
import { Project } from '@/types';

const ProjectCSVImport: React.FC = () => {
  const { loadProjectsFromCSV, projects, addProject } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocallyLoaded, setIsLocallyLoaded] = useState(false);
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
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
        // Importer localement les projets
        const parsedProjects = parseCSVForLocalImport(content);
        setLocalProjects(parsedProjects);
        
        // Ajouter les projets localement
        parsedProjects.forEach(project => {
          // Vérifier si le projet existe déjà
          const existingProject = projects.find(p => p.code === project.code);
          if (!existingProject) {
            addProject(project);
          }
        });
        
        setIsLocallyLoaded(true);
        showImportSuccess(parsedProjects.length, "affaires", true);
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
    if (localProjects.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucune affaire à synchroniser",
        description: "Veuillez d'abord importer un fichier CSV",
      });
      return;
    }
    
    setIsSyncingToDb(true);
    toast({
      title: "Synchronisation avec la base de données",
      description: "Sauvegarde des affaires en cours...",
    });
    
    try {
      await loadProjectsFromCSV(convertProjectsToCSV(localProjects));
      setLocalProjects([]);
      setIsLocallyLoaded(false);
      toast({
        title: "Synchronisation réussie",
        description: "Les affaires ont été enregistrées dans la base de données",
      });
    } catch (error) {
      showImportError(error);
    } finally {
      setIsSyncingToDb(false);
    }
  };
  
  // Fonction pour convertir un objet projet en format CSV
  const convertProjectsToCSV = (projects: Project[]): string => {
    // En-têtes CSV
    const headers = "code,name";
    
    // Lignes de projets
    const rows = projects.map(project => {
      return `${project.code},${project.name}`;
    }).join('\n');
    
    return `${headers}\n${rows}`;
  };
  
  // Fonction pour parser le CSV en objets projets
  const parseCSVForLocalImport = (csvContent: string): Project[] => {
    const { headers, lines } = parseCSV(csvContent);
    const projects: Project[] = [];
    
    // Mapping pour les noms de colonnes du format fourni
    const codeIndex = headers.findIndex(h => h === 'code');
    const nameIndex = headers.findIndex(h => h === 'name');
    
    if (codeIndex === -1 || nameIndex === -1) {
      throw new Error("Format CSV invalide: colonnes 'code' et 'name' requises");
    }
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const values = line.split(',').map(value => value.trim());
      
      const code = values[codeIndex];
      const name = values[nameIndex];
      
      if (code && name) {
        projects.push({
          id: `temp-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          code,
          name
        });
      }
    }
    
    return projects;
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importer des affaires</CardTitle>
        <CardDescription>
          Chargez un fichier CSV contenant la liste d'affaires
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
            <p><strong>code</strong>, <strong>name</strong></p>
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs">
              <p className="font-semibold mb-1">Exemple :</p>
              <p>code,name</p>
              <p>PR001,Projet Résidentiel Avenue Victor Hugo</p>
              <p>PR002,Rénovation Immeuble Saint-Michel</p>
              <p>PR003,Construction Bureaux Centre-Ville</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCSVImport;
