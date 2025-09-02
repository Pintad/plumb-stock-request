import React, { useRef, useState } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showVisibilityWarning, setShowVisibilityWarning] = useState(false);
  const importIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Surveiller la visibilité de l'onglet
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);
      
      if (!isVisible && isImporting) {
        setShowVisibilityWarning(true);
        // Optionnel: ralentir les opérations mais ne pas les arrêter
      } else if (isVisible && showVisibilityWarning) {
        setShowVisibilityWarning(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isImporting, showVisibilityWarning]);

  // Maintenir l'onglet "actif" pendant l'import
  React.useEffect(() => {
    if (isImporting) {
      // Créer un petit ping pour maintenir l'activité
      importIntervalRef.current = setInterval(() => {
        // Ne rien faire, juste maintenir l'activité JavaScript
      }, 1000);
    } else {
      if (importIntervalRef.current) {
        clearInterval(importIntervalRef.current);
        importIntervalRef.current = null;
      }
    }

    return () => {
      if (importIntervalRef.current) {
        clearInterval(importIntervalRef.current);
      }
    };
  }, [isImporting]);

  const handleExportCSV = async () => {
    try {
      // Récupérer toutes les données du catalogue sans limite
      let allData: any[] = [];
      let start = 0;
      const batchSize = 1000;
      
      while (true) {
        const { data: batchData, error } = await supabase
          .from('catalogue')
          .select('*')
          .order('designation')
          .range(start, start + batchSize - 1);

        if (error) throw error;

        if (!batchData || batchData.length === 0) {
          break;
        }

        allData = [...allData, ...batchData];
        
        // Si on récupère moins que batchSize, on a atteint la fin
        if (batchData.length < batchSize) {
          break;
        }
        
        start += batchSize;
      }

      if (allData.length === 0) {
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
        allData,
        columns,
        `catalogue_export_${new Date().toISOString().split('T')[0]}`,
        'Catalogue'
      );

      toast({
        title: "Export réussi",
        description: `${allData.length} articles exportés avec succès`
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Démarrer l'import avec indicateur de progression
    setIsImporting(true);
    setImportProgress(0);
    setCurrentStep('Lecture du fichier...');

    try {
      if (isCSV) {
        readCSVFile(file, (content) => {
          processCSVImport(content);
        });
      } else if (isExcel) {
        await readExcelFile(file);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      setIsImporting(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du fichier"
      });
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
    
    // Déterminer le nombre total de lignes et de colonnes du worksheet
    const maxRow = worksheet.rowCount || 0;
    const maxCol = worksheet.columnCount || 20; // Fallback à 20 colonnes si indéterminé

    // Parcourir toutes les lignes via getRow pour éviter les limites de eachRow
    for (let rowNumber = 1; rowNumber <= maxRow; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const values: string[] = [];

      for (let colNumber = 1; colNumber <= maxCol; colNumber++) {
        const cell = row.getCell(colNumber);
        let value = '';

        if (cell && cell.value !== null && cell.value !== undefined) {
          // Gérer les formules et autres types de cellules
          if (typeof cell.value === 'object' && 'result' in (cell.value as any)) {
            value = (cell.value as any).result?.toString() || '';
          } else {
            value = String(cell.value);
          }
        }

        // Échapper les virgules et guillemets
        const escapedValue = value.includes(',') || value.includes('"') || value.includes('\n')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
        values.push(escapedValue);
      }

      csvLines.push(values.join(','));
    }

    console.log(`📊 Excel converti: ${csvLines.length} lignes (sur ${maxRow} attendues), ${maxCol} colonnes`);
    return csvLines.join('\n');
  };

  const processCSVImport = async (csvContent: string) => {
    try {
      setCurrentStep('Analyse du fichier...');
      setImportProgress(10);
      
      const { headers, lines } = parseCSV(csvContent);
      
      if (lines.length === 0) {
        setIsImporting(false);
        toast({
          variant: "destructive",
          title: "Fichier vide",
          description: "Le fichier CSV ne contient aucune donnée"
        });
        return;
      }

      setCurrentStep('Traitement des données...');
      setImportProgress(20);

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

      setCurrentStep(`Validation de ${lines.length} lignes...`);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
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
        
        // Mettre à jour le progrès de validation
        if (i % 10 === 0) {
          const progress = 20 + ((i / lines.length) * 30);
          setImportProgress(progress);
        }
      }

      if (processedItems.length === 0) {
        setIsImporting(false);
        toast({
          variant: "destructive",
          title: "Aucun article valide",
          description: "Aucun article valide trouvé dans le fichier"
        });
        return;
      }

      setImportProgress(50);
      console.log('Articles traités pour import:', processedItems);
      console.log('Colonne ID présente:', hasIdColumn);

      // Traitement selon la présence de l'ID
      if (hasIdColumn) {
        // Séparer les articles avec et sans ID
        const itemsWithId = processedItems.filter(item => item.id && item.id.trim() !== '');
        const itemsWithoutId = processedItems.filter(item => !item.id || item.id.trim() === '');
        
        console.log(`Articles avec ID: ${itemsWithId.length}, Articles sans ID: ${itemsWithoutId.length}`);
        
        if (itemsWithId.length > 0) {
          setCurrentStep(`Mise à jour de ${itemsWithId.length} articles...`);
          await updateExistingItems(itemsWithId, processedItems.length);
        }
        if (itemsWithoutId.length > 0) {
          setCurrentStep(`Création de ${itemsWithoutId.length} nouveaux articles...`);
          await createNewItems(itemsWithoutId, processedItems.length);
        }
      } else {
        setCurrentStep(`Création de ${processedItems.length} nouveaux articles...`);
        await createNewItems(processedItems, processedItems.length);
      }

      setImportProgress(100);
      setCurrentStep('Import terminé !');
      
      // Délai pour montrer le succès avant de masquer
      setTimeout(() => {
        setIsImporting(false);
        onImportComplete();
      }, 1000);

    } catch (error) {
      console.error('Erreur processCSVImport:', error);
      setIsImporting(false);
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

  const updateExistingItems = async (items: any[], totalItems?: number) => {
    try {
      let updatedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
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

        // Mettre à jour le progrès plus fréquemment
        const progress = 50 + ((i / items.length) * 25);
        setImportProgress(progress);
        setCurrentStep(`Mise à jour... ${i + 1}/${items.length}`);
        
        // Petite pause pour maintenir la réactivité
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 25));
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

  const createNewItems = async (items: any[], totalItems?: number) => {
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

      // Traiter par batch plus petit pour maintenir la réactivité
      const batchSize = 25;
      let insertedCount = 0;
      
      for (let i = 0; i < itemsToInsert.length; i += batchSize) {
        const batch = itemsToInsert.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('catalogue')
          .upsert(batch, { 
            onConflict: 'reference',
            ignoreDuplicates: false 
          });

        if (error) throw error;
        
        insertedCount += batch.length;
        
        // Mettre à jour le progrès
        const progress = 50 + ((insertedCount / itemsToInsert.length) * 40);
        setImportProgress(progress);
        setCurrentStep(`Création en cours... ${insertedCount}/${itemsToInsert.length}`);
        
        // Petite pause pour éviter de surcharger le navigateur et maintenir la réactivité
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      showImportSuccess(itemsToInsert.length, 'nouveaux articles créés');

    } catch (error) {
      showImportError(error);
    }
  };

  return (
    <div className="space-y-4">
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
          disabled={isImporting}
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Importer Excel
        </Button>
      </div>

      {/* Avertissement de visibilité */}
      {showVisibilityWarning && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium">
              ⚠️ Import en cours en arrière-plan
            </p>
          </div>
          <p className="text-xs text-orange-600 mt-1">
            L'import continue même si cet onglet n'est pas visible. Évitez de fermer la fenêtre.
          </p>
        </div>
      )}

      {/* Indicateur de progression */}
      {isImporting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{currentStep}</span>
            <span>{Math.round(importProgress)}%</span>
          </div>
          <Progress value={importProgress} className="w-full" />
          <p className="text-xs text-muted-foreground">
            💡 L'import continue même si vous changez d'onglet. Ne fermez pas cette fenêtre.
          </p>
        </div>
      )}

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