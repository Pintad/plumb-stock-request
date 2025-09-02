
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
 * Parse a CSV line correctly handling quotes and the given delimiter
 * @param line The CSV line to parse
 * @param delimiter The field delimiter (default ',')
 * @returns Array of parsed values
 */
export const parseCSVLine = (line: string, delimiter: ',' | ';' | '\t' = ','): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Double quote escaped
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
};

/**
 * Parse CSV content and extract headers
 * - Auto-detects delimiter between ',', ';', and '\t'
 * @param csvContent The CSV content to parse
 * @returns An object with headers, lines and the detected delimiter
 */
export const parseCSV = (csvContent: string) => {
  const rawLines = csvContent.split(/\r?\n/);
  if (rawLines.length === 0) {
    throw new Error("Le fichier CSV est vide");
  }
  
  if (rawLines.length === 1 && rawLines[0].trim() === '') {
    throw new Error("Le fichier CSV est vide");
  }
  
  const lines = rawLines.filter(line => line.trim() !== '');
  const headerLine = lines[0];

  // Detect delimiter by the highest occurrence among candidates
  const candidates: Array<',' | ';' | '\t'> = [',', ';', '\t'];
  const counts = candidates.map(d => (headerLine.match(new RegExp(`\\${d}`, 'g')) || []).length);
  const maxIndex = counts.indexOf(Math.max(...counts));
  const delimiter = candidates[maxIndex] ?? ',';

  // Use proper CSV parsing for headers with the detected delimiter
  const headers = parseCSVLine(headerLine, delimiter).map(header => header.trim().toLowerCase());
  
  if (headers.length === 0) {
    throw new Error("Le fichier CSV ne contient pas d'en-têtes");
  }
  
  const dataLines = lines.slice(1);
  
  console.log('CSV parsing - Delimiter:', JSON.stringify(delimiter));
  console.log('CSV parsing - Headers found:', headers);
  console.log('CSV parsing - Data lines:', dataLines.length);
  
  return { headers, lines: dataLines, delimiter };
};

/**
 * Show a success toast for imported items
 * @param count Number of items imported
 * @param itemType Type of items imported (e.g., "produits", "affaires")
 * @param isLocalImport Whether the import is local or synchronized with database
 */
export const showImportSuccess = (count: number, itemType: string, isLocalImport = false) => {
  toast({
    title: "Import réussi",
    description: `${count} ${itemType} ${isLocalImport ? 'chargés localement' : 'importés en base de données'} avec succès`,
  });
};

/**
 * Show an error toast for import errors
 * @param error The error object
 * @param isLocalImport Whether the import is local or synchronized with database
 */
export const showImportError = (error: unknown, isLocalImport = false) => {
  console.error(`Erreur d'${isLocalImport ? 'importation locale' : 'importation en base de données'}:`, error);
  toast({
    variant: "destructive",
    title: `Erreur d'${isLocalImport ? 'importation locale' : 'importation en base de données'}`,
    description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'importation",
  });
};
