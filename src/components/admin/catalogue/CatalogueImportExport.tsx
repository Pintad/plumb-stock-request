import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { exportDataToExcel } from '@/lib/utils/excelUtils';
import { readCSVFile, parseCSV, showImportSuccess, showImportError } from '@/context/imports/csvUtils';
import * as ExcelJS from 'exceljs';

interface CatalogueImportExportProps {
  onImportComplete: () => void;
}

export const CatalogueImportExport: React.FC<CatalogueImportExportProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = async () => {
    try {
      // Récupérer toutes les données du catalogue
      const { data: catalogueData, error } = await supabase
        .from('catalogue')
        .select('*')
        .order('designation');

      if (error) throw error;

      if (!catalogueData || catalogueData.length === 0) {
        toast({
          variant: "destructive",
          title: "Aucune donnée",
          description: "Aucun article trouvé dans le catalogue"
        });
        return;
      }

      // Configuration des colonnes pour l'export
      const columns = [
        { header: 'ID', key: 'id', width: 20 },
        { header: 'Désignation', key: 'designation', width: 30 },
        { header: 'Catégorie', key: 'categorie', width: 20 },
        { header: 'Sur Catégorie', key: 'sur_categorie', width: 20 },
        { header: 'Variante', key: 'variante', width: 20 },
        { header: 'Référence', key: 'reference', width: 20 },
        { header: 'Unité', key: 'unite', width: 15 },
        { header: 'URL Image', key: 'image_url', width: 30 },
        { header: 'Mots-clés', key: 'keywords', width: 25 }
      ];

      // Exporter vers Excel
      await exportDataToExcel(
        catalogueData,
        columns,
        `catalogue_export_${new Date().toISOString().split('T')[0]}`,
        'Catalogue'
      );

      toast({
        title: "Export réussi",
        description: `${catalogueData.length} articles exportés avec succès`
      });

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export"
      });
    }
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier l'extension du fichier
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      toast({
        variant: "destructive",
        title: "Format de fichier incorrect",
        description: "Veuillez charger un fichier CSV ou Excel (.xlsx)"
      });
      return;
    }

    if (isCSV) {
      readCSVFile(file, (content) => {
        processCSVImport(content);
      });
    } else if (isExcel) {
      readExcelFile(file);
    }

    // Reset input
    event.target.value = '';
  };

  const readExcelFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      const worksheet = workbook.getWorksheet(1); // Premier onglet
      if (!worksheet) {
        toast({
          variant: "destructive",
          title: "Fichier invalide",
          description: "Le fichier Excel ne contient aucune feuille de calcul"
        });
        return;
      }

      // Convertir en format CSV pour réutiliser la logique existante
      const csvContent = convertWorksheetToCSV(worksheet);
      processCSVImport(csvContent);

    } catch (error) {
      console.error('Erreur lecture Excel:', error);
      toast({
        variant: "destructive",
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier Excel"
      });
    }
  };

  const convertWorksheetToCSV = (worksheet: ExcelJS.Worksheet): string => {
    const csvLines: string[] = [];
    
    worksheet.eachRow((row, rowNumber) => {
      const values: string[] = [];
      const maxCol = row.cellCount;
      
      // S'assurer qu'on a toutes les colonnes même si elles sont vides
      for (let colNumber = 1; colNumber <= maxCol; colNumber++) {
        const cell = row.getCell(colNumber);
        let value = '';
        
        if (cell.value !== null && cell.value !== undefined) {
          value = cell.value.toString();
        }
        
        // Échapper les virgules et guillemets
        const escapedValue = value.includes(',') || value.includes('"') || value.includes('\n')
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
        values.push(escapedValue);
      }
      csvLines.push(values.join(','));
    });
    
    return csvLines.join('\n');
  };

  const processCSVImport = async (csvContent: string) => {
    try {
      const { headers, lines } = parseCSV(csvContent);
      
      if (lines.length === 0) {
        toast({
          variant: "destructive",
          title: "Fichier vide",
          description: "Le fichier CSV ne contient aucune donnée"
        });
        return;
      }

      // Normaliser les en-têtes pour qu'ils correspondent aux colonnes DB
      const normalizedHeaders = headers.map(header => {
        const cleanHeader = header.trim().toLowerCase();
        // Mapper les en-têtes français vers les noms de colonnes DB
        const headerMapping: Record<string, string> = {
          'désignation': 'designation',
          'catégorie': 'categorie',
          'sur catégorie': 'sur_categorie',
          'url image': 'image_url',
          'mots-clés': 'keywords',
          'référence': 'reference',
          'unité': 'unite'
        };
        return headerMapping[cleanHeader] || cleanHeader;
      });

      // Vérifier si la colonne ID est présente
      const hasIdColumn = normalizedHeaders.includes('id');
      const processedItems = [];

      for (const line of lines) {
        if (!line.trim()) continue;

        // Parser la ligne CSV correctement en gérant les guillemets
        const values = parseCSVLine(line);
        const item: any = {};

        // Mapper les colonnes
        normalizedHeaders.forEach((header, index) => {
          if (values[index] !== undefined) {
            const value = values[index].trim();
            item[header] = value === '' || value === 'null' ? null : value;
          }
        });

        // Validation des champs obligatoires
        if (!item.designation) {
          console.warn('Ligne ignorée: désignation manquante', item);
          continue;
        }

        processedItems.push(item);
      }

      if (processedItems.length === 0) {
        toast({
          variant: "destructive",
          title: "Aucun article valide",
          description: "Aucun article valide trouvé dans le fichier"
        });
        return;
      }

      console.log('Articles traités pour import:', processedItems);
      console.log('Colonne ID présente:', hasIdColumn);

      // Traitement selon la présence de l'ID
      if (hasIdColumn) {
        // Séparer les articles avec et sans ID
        const itemsWithId = processedItems.filter(item => item.id && item.id.trim() !== '');
        const itemsWithoutId = processedItems.filter(item => !item.id || item.id.trim() === '');
        
        console.log(`Articles avec ID: ${itemsWithId.length}, Articles sans ID: ${itemsWithoutId.length}`);
        
        if (itemsWithId.length > 0) {
          await updateExistingItems(itemsWithId);
        }
        if (itemsWithoutId.length > 0) {
          await createNewItems(itemsWithoutId);
        }
      } else {
        await createNewItems(processedItems);
      }

      onImportComplete();

    } catch (error) {
      console.error('Erreur processCSVImport:', error);
      showImportError(error);
    }
  };

  // Fonction pour parser correctement une ligne CSV avec guillemets
  const parseCSVLine = (line: string): string[] => {
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
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current);
    
    return result;
  };

  const updateExistingItems = async (items: any[]) => {
    try {
      let updatedCount = 0;
      let errorCount = 0;

      for (const item of items) {
        if (!item.id) continue;

        const { error } = await supabase
          .from('catalogue')
          .update({
            designation: item.designation,
            categorie: item.categorie || null,
            sur_categorie: item.sur_categorie || 'RACCORD',
            variante: item.variante || null,
            reference: item.reference || null,
            unite: item.unite || null,
            image_url: item.image_url || null,
            keywords: item.keywords || null
          })
          .eq('id', item.id);

        if (error) {
          console.error('Erreur mise à jour article:', error);
          errorCount++;
        } else {
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        showImportSuccess(updatedCount, 'articles mis à jour');
      }

      if (errorCount > 0) {
        toast({
          variant: "destructive",
          title: "Import partiellement réussi",
          description: `${updatedCount} articles mis à jour, ${errorCount} erreurs`
        });
      }

    } catch (error) {
      showImportError(error);
    }
  };

  const createNewItems = async (items: any[]) => {
    try {
      const itemsToInsert = items.map(item => ({
        designation: item.designation,
        categorie: item.categorie || null,
        sur_categorie: item.sur_categorie || 'RACCORD',
        variante: item.variante || null,
        reference: item.reference || null,
        unite: item.unite || null,
        image_url: item.image_url || null,
        keywords: item.keywords || null
      }));

      const { error } = await supabase
        .from('catalogue')
        .insert(itemsToInsert);

      if (error) throw error;

      showImportSuccess(itemsToInsert.length, 'nouveaux articles créés');

    } catch (error) {
      showImportError(error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleExportCSV}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Exporter Excel
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleImportCSV}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Importer Excel/CSV
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};