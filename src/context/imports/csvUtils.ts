
import { toast } from '@/components/ui/use-toast';

/**
 * Validates and reads a CSV file
 * @param file The CSV file to read
 * @param onSuccess Callback when file is successfully read
 */
export const readCSVFile = (
  file: File,
  onSuccess: (content: string) => void
): void => {
  // Vérifier que c'est un fichier CSV
  if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
    toast({
      variant: "destructive",
      title: "Format de fichier incorrect",
      description: "Veuillez charger un fichier CSV",
    });
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      
      if (!content || content.trim().length === 0) {
        toast({
          variant: "destructive",
          title: "Fichier vide",
          description: "Le fichier CSV est vide",
        });
        return;
      }
      
      onSuccess(content);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de traitement",
        description: "Impossible de traiter le fichier CSV",
      });
    }
  };
  
  reader.onerror = () => {
    toast({
      variant: "destructive",
      title: "Erreur de lecture",
      description: "Impossible de lire le fichier",
    });
  };
  
  reader.readAsText(file);
};

/**
 * Parse CSV content and extract headers
 * @param csvContent The CSV content to parse
 * @returns An object with headers and lines
 */
export const parseCSV = (csvContent: string) => {
  const lines = csvContent.split('\n');
  if (lines.length === 0) {
    throw new Error("Le fichier CSV est vide");
  }
  
  if (lines.length === 1 && lines[0].trim() === '') {
    throw new Error("Le fichier CSV est vide");
  }
  
  const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
  if (headers.length === 0) {
    throw new Error("Le fichier CSV ne contient pas d'en-têtes");
  }
  
  return { headers, lines: lines.slice(1).filter(line => line.trim() !== '') };
};

/**
 * Show a success toast for imported items
 * @param count Number of items imported
 * @param itemType Type of items imported (e.g., "produits", "affaires")
 */
export const showImportSuccess = (count: number, itemType: string) => {
  toast({
    title: "Import réussi",
    description: `${count} ${itemType} importés avec succès`,
  });
};

/**
 * Show an error toast for import errors
 * @param error The error object
 */
export const showImportError = (error: unknown) => {
  console.error("Erreur d'importation:", error);
  toast({
    variant: "destructive",
    title: "Erreur d'importation",
    description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'importation",
  });
};
