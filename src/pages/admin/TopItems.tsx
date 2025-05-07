
import React, { useMemo } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Package, TrendingUp, ArrowUpDown, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { exportDataToExcel } from '@/lib/utils/excelUtils';

const TopItems = () => {
  const { orders, products, isLoading } = useAppContext();
  
  // Données pour les articles les plus commandés
  const topItemsData = useMemo(() => {
    // Comptabiliser tous les articles commandés
    const itemCounts = orders.reduce((acc, order) => {
      order.articles.forEach(article => {
        const itemKey = article.selectedVariantId 
          ? `${article.name}-${article.selectedVariantId}`
          : article.name;
        
        if (!acc[itemKey]) {
          acc[itemKey] = {
            name: article.name,
            variantName: article.selectedVariantId 
              ? article.variants?.find(v => v.id === article.selectedVariantId)?.variantName || ''
              : '',
            count: 0,
            quantity: 0,
            productId: article.id
          };
        }
        
        acc[itemKey].count += 1;
        acc[itemKey].quantity += article.quantity;
      });
      return acc;
    }, {} as Record<string, { 
      name: string; 
      variantName: string; 
      count: number; 
      quantity: number; 
      productId: string;
    }>);
    
    // Convertir en tableau et trier par nombre de commandes
    return Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .map(item => ({
        name: item.variantName ? `${item.name} (${item.variantName})` : item.name,
        displayName: item.name,
        variant: item.variantName,
        count: item.count,
        quantity: item.quantity
      }));
  }, [orders, products]);

  // Données pour le graphique
  const chartData = useMemo(() => {
    return topItemsData.slice(0, 10); // Top 10 des articles
  }, [topItemsData]);

  // Configuration des couleurs pour les graphiques
  const chartConfig = {
    quantity: { color: "#f97316", label: "Quantité totale" },
    count: { color: "#6E59A5", label: "Nombre de demandes" },
  };

  // Fonction d'export Excel
  const exportToExcel = async () => {
    try {
      // Créer un nouveau classeur Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Articles commandés');
      
      // Ajouter les en-têtes avec style
      worksheet.columns = [
        { header: 'Article', key: 'article', width: 30 },
        { header: 'Variante', key: 'variante', width: 20 },
        { header: 'Demandes', key: 'demandes', width: 15 },
        { header: 'Quantité totale', key: 'quantite', width: 15 }
      ];
      
      // Style pour l'en-tête
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Texte blanc
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF97316' } // Couleur ambre comme dans l'interface
      };
      
      // Ajouter les données
      topItemsData.forEach(item => {
        worksheet.addRow({
          article: item.displayName,
          variante: item.variant || '',
          demandes: item.count,
          quantite: item.quantity
        });
      });
      
      // Appliquer des bordures légères à toutes les cellules
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };
          
          // Alignement du texte
          cell.alignment = { vertical: 'middle' };
          
          // Colorer les cellules de quantité pour les mettre en évidence
          if (rowNumber > 1 && cell.col === 4) {  // Fix: Converting cell.col to number or comparing with a number 
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFF3E0' } // Fond ambre clair
            };
            cell.font = { bold: true };
          }
        });
      });
      
      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Créer un blob et le télécharger
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `articles_plus_commandes_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Articles les plus commandés</h1>
            <p className="text-gray-500">Analyse des articles les plus demandés pour anticiper les stocks</p>
          </div>
          <Package className="h-8 w-8 text-amber-500" />
        </div>
        
        {/* Graphique des articles les plus commandés */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top 10 des articles les plus demandés</CardTitle>
            <CardDescription>Par quantité totale commandée</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              config={chartConfig}
              className="h-80 mt-4"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="quantity" 
                    name="Quantité totale" 
                    fill={chartConfig.quantity.color}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Tableau détaillé des articles */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Liste complète des articles commandés</CardTitle>
              <CardDescription>
                Triés par quantité totale commandée
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex gap-2 items-center" 
                onClick={exportToExcel}
              >
                <FileDown className="h-4 w-4" />
                Exporter Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : topItemsData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-4 px-6 font-medium text-gray-600">Article</th>
                      <th className="text-center py-4 px-6 font-medium text-gray-600">
                        <div className="flex items-center justify-center">
                          <span>Demandes</span>
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-medium text-gray-600">
                        <div className="flex items-center justify-center">
                          <span>Quantité totale</span>
                          <TrendingUp className="ml-2 h-4 w-4 text-amber-500" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topItemsData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <div>
                            <p className="font-medium">{item.displayName}</p>
                            {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-center">{item.count}</td>
                        <td className="py-3 px-6 text-center font-semibold">
                          <span className="bg-amber-100 text-amber-800 py-1 px-2 rounded-full">
                            {item.quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Aucun article n'a été commandé
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Composant personnalisé pour le tooltip du graphique
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    
    return (
      <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 text-sm">
        <p className="font-semibold">{item.displayName}</p>
        {item.variant && <p className="text-gray-600">{item.variant}</p>}
        <p className="text-amber-600 mt-1">Quantité totale: {item.quantity}</p>
        <p className="text-purple-600">Nombre de demandes: {item.count}</p>
      </div>
    );
  }

  return null;
};

export default TopItems;
