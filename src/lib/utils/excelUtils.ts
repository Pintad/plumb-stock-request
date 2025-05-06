
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Fonction utilitaire pour exporter des données vers Excel avec un style cohérent
 * @param data Les données à exporter
 * @param columns Configuration des colonnes (header, key, width)
 * @param filename Nom du fichier sans extension
 * @param worksheetName Nom de la feuille Excel
 */
export const exportDataToExcel = async <T extends Record<string, any>>(
  data: T[],
  columns: {header: string; key: string; width?: number}[],
  filename: string,
  worksheetName: string = 'Données'
): Promise<void> => {
  try {
    // Créer un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);
    
    // Définir les colonnes
    worksheet.columns = columns;
    
    // Style pour l'en-tête
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF97316' } // Couleur ambre
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Texte blanc
    
    // Ajouter les données
    data.forEach(item => {
      const rowData: Record<string, any> = {};
      columns.forEach(col => {
        rowData[col.key] = item[col.key] !== undefined ? item[col.key] : '';
      });
      worksheet.addRow(rowData);
    });
    
    // Appliquer des bordures légères à toutes les cellules
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
        cell.alignment = { vertical: 'middle' };
      });
    });
    
    // Générer le fichier Excel
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Créer un blob et le télécharger
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
    
  } catch (error) {
    console.error("Erreur lors de l'export Excel:", error);
    throw error;
  }
};
