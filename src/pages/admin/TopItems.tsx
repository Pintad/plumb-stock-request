
import React, { useMemo } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Package, ArrowUpRightFromCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ChartContainer,
  ChartTooltip
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const TopItems = () => {
  const { orders, isLoading } = useAppContext();

  // Analyser les données pour créer un classement des articles les plus commandés
  const topItemsData = useMemo(() => {
    // Comptabiliser tous les articles commandés
    const itemCounts = orders.reduce((acc, order) => {
      order.articles.forEach(article => {
        const itemKey = article.selectedVariantId 
          ? `${article.name}-${article.selectedVariantId}`
          : article.name;
        
        if (!acc[itemKey]) {
          acc[itemKey] = {
            id: article.id,
            name: article.name,
            variantName: article.selectedVariantId 
              ? article.variants?.find(v => v.id === article.selectedVariantId)?.variantName || ''
              : '',
            reference: article.reference || article.selectedVariantId 
              ? article.variants?.find(v => v.id === article.selectedVariantId)?.reference || ''
              : '',
            unit: article.unit || article.selectedVariantId
              ? article.variants?.find(v => v.id === article.selectedVariantId)?.unit || ''
              : '',
            category: article.category || '',
            count: 0,           // Nombre de commandes contenant cet article
            quantity: 0,        // Quantité totale commandée
            pendingQuantity: 0, // Quantité en attente
            imageUrl: article.imageUrl || ''
          };
        }
        
        acc[itemKey].count += 1;
        acc[itemKey].quantity += article.quantity;
        
        // Si la commande n'est pas terminée, ajouter à la quantité en attente
        if (order.termine !== 'Oui') {
          acc[itemKey].pendingQuantity += article.quantity;
        }
      });
      return acc;
    }, {} as Record<string, {
      id: string;
      name: string;
      variantName: string;
      reference: string;
      unit: string;
      category: string;
      count: number;
      quantity: number;
      pendingQuantity: number;
      imageUrl: string;
    }>);
    
    // Convertir en tableau et trier par nombre de commandes
    return Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity);
  }, [orders]);

  // Données pour le graphique des articles les plus commandés (top 10)
  const topItemsChartData = useMemo(() => {
    return topItemsData.slice(0, 10).map(item => ({
      name: item.variantName ? `${item.name} (${item.variantName})` : item.name,
      shortName: (item.variantName 
        ? `${item.name.substring(0, 15)}... (${item.variantName.substring(0, 5)}...)`
        : item.name.substring(0, 20) + (item.name.length > 20 ? '...' : '')),
      quantity: item.quantity,
      pending: item.pendingQuantity
    }));
  }, [topItemsData]);

  // Configuration des couleurs pour les graphiques
  const chartConfig = {
    quantity: { color: "#f97316", label: "Quantité totale" },
    pending: { color: "#9b87f5", label: "En attente" },
  };

  // Fonction pour tronquer le texte trop long
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Articles les plus commandés</h1>
            <p className="text-gray-500">Analyse des produits pour l'anticipation des stocks</p>
          </div>
          <Package className="h-8 w-8 text-amber-500" />
        </div>

        {/* Graphique des articles les plus demandés */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top 10 des articles</CardTitle>
            <CardDescription>Articles les plus demandés en quantité</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <ChartContainer
                config={chartConfig}
                className="h-[400px] mt-4"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topItemsChartData}
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="shortName" 
                      width={150}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 text-sm">
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-amber-600">Quantité totale: {item.quantity}</p>
                              <p className="text-purple-600">En attente: {item.pending}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="quantity" 
                      name="Quantité totale" 
                      fill={chartConfig.quantity.color}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Tableau détaillé */}
        <Card>
          <CardHeader>
            <CardTitle>Liste complète des articles</CardTitle>
            <CardDescription>Classés par popularité</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : topItemsData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-center">Commandes</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end">
                          <span>Quantité</span>
                          <TrendingUp className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">En attente</TableHead>
                      <TableHead className="text-right">Unité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topItemsData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.imageUrl && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-8 h-8 object-contain rounded border border-gray-200" 
                              />
                            )}
                            <div>
                              {truncateText(item.name, 30)}
                              {item.variantName && (
                                <div className="text-xs text-gray-500">
                                  {truncateText(item.variantName, 20)}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500">{truncateText(item.reference, 15)}</TableCell>
                        <TableCell>
                          {item.category && (
                            <Badge variant="outline" className="bg-gray-50">
                              {truncateText(item.category, 15)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{item.count}</TableCell>
                        <TableCell className="text-right font-semibold">
                          <span className="bg-amber-100 text-amber-800 py-1 px-2 rounded-full">
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.pendingQuantity > 0 ? (
                            <span className="bg-purple-100 text-purple-800 py-1 px-2 rounded-full">
                              {item.pendingQuantity}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-gray-500">{item.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-center text-gray-500">Aucun article commandé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TopItems;
