
import React, { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { Package, FileText, ListChecks, Trophy, Clock, ChartBar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ChartContainer,
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const { orders, products, user, loadOrders, isLoading } = useAppContext();
  
  // Charger les commandes lorsque le tableau de bord se monte
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Préparation des données pour les statistiques
  const orderStats = useMemo(() => {
    // Nombre de demandes par statut
    const pendingOrders = orders.filter(order => order.termine === 'Non').length;
    const inProgressOrders = orders.filter(order => order.termine === 'En cours').length;
    const completedOrders = orders.filter(order => order.termine === 'Oui').length;
    
    // Nombre total d'articles demandés
    const totalItems = orders.reduce((sum, order) => 
      sum + order.articles.reduce((itemSum, article) => itemSum + article.quantity, 0), 0);
      
    return { pendingOrders, inProgressOrders, completedOrders, totalItems };
  }, [orders]);

  // Données pour le graphique des meilleurs demandeurs (ouvriers qui anticipent le plus)
  const topRequestersData = useMemo(() => {
    // Regrouper les commandes par ouvrier
    const requestsByWorker = orders.reduce((acc, order) => {
      const workerName = order.clientname || 'Inconnu';
      
      if (!acc[workerName]) {
        acc[workerName] = { 
          name: workerName,
          orderCount: 0,
          itemCount: 0,
          anticipatedOrders: 0 // Commandes avec date de mise à disposition
        };
      }
      
      acc[workerName].orderCount += 1;
      acc[workerName].itemCount += order.articles.length;
      
      // Si la commande a une date de mise à disposition, c'est une commande anticipée
      if (order.date_mise_a_disposition) {
        acc[workerName].anticipatedOrders += 1;
      }
      
      return acc;
    }, {});
    
    // Convertir en tableau et trier par nombre de commandes
    return Object.values(requestsByWorker)
      .sort((a: any, b: any) => b.anticipatedOrders - a.anticipatedOrders || b.orderCount - a.orderCount)
      .slice(0, 5); // Top 5 des demandeurs
  }, [orders]);

  // Configuration des couleurs pour les graphiques
  const chartConfig = {
    pending: { color: "#f97316", label: "En attente" },
    inProgress: { color: "#9b87f5", label: "En cours" },
    completed: { color: "#10b981", label: "Terminées" },
    items: { color: "#6E59A5", label: "Articles" },
  };
  
  // Données des commandes par date pour voir les tendances
  const ordersByDateData = useMemo(() => {
    // Créer un dictionnaire des 14 derniers jours
    const last14Days = [...Array(14)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'dd MMM', { locale: fr }),
        pending: 0,
        completed: 0
      };
    });
    
    // Regrouper les commandes par date
    orders.forEach(order => {
      if (!order.datecommande) return;
      
      const orderDate = order.datecommande.split('T')[0];
      const dayData = last14Days.find(d => d.date === orderDate);
      
      if (dayData) {
        if (order.termine === 'Oui') {
          dayData.completed += 1;
        } else {
          dayData.pending += 1;
        }
      }
    });
    
    return last14Days;
  }, [orders]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-500 mb-6">Bienvenue, {user?.name}</p>
        
        {/* Cartes de statistiques principales */}
        <div className="grid gap-4 md:grid-cols-4">
          <Link to="/admin/orders" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">En attente</CardTitle>
                <Clock className="h-6 w-6 text-amber-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{orderStats.pendingOrders}</p>
                <CardDescription>Demandes à traiter</CardDescription>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/orders" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">En cours</CardTitle>
                <ListChecks className="h-6 w-6 text-purple-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{orderStats.inProgressOrders}</p>
                <CardDescription>Demandes en préparation</CardDescription>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/orders" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Terminées</CardTitle>
                <FileText className="h-6 w-6 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{orderStats.completedOrders}</p>
                <CardDescription>Demandes complétées</CardDescription>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/orders" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Articles</CardTitle>
                <Package className="h-6 w-6 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{orderStats.totalItems}</p>
                <CardDescription>Produits demandés</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Graphique des commandes sur les 14 derniers jours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Évolution des demandes</CardTitle>
              <CardDescription>Sur les 14 derniers jours</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer
                config={chartConfig}
                className="h-[300px] mt-4"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ordersByDateData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="displayDate" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="pending" 
                      name="En attente" 
                      stackId="a" 
                      fill={chartConfig.pending.color} 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="completed" 
                      name="Terminées" 
                      stackId="a" 
                      fill={chartConfig.completed.color}
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* Graphique des ouvriers qui anticipent le plus */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-lg">Meilleurs anticipateurs</CardTitle>
                <CardDescription>Ouvriers avec le plus de demandes planifiées</CardDescription>
              </div>
              <Trophy className="h-6 w-6 text-amber-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer
                config={chartConfig}
                className="h-[300px] mt-4"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topRequestersData}
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      tickFormatter={(value) => {
                        return value.length > 12 ? `${value.substring(0, 12)}...` : value;
                      }}
                    />
                    <Tooltip content={<CustomWorkerTooltip />} />
                    <Bar 
                      dataKey="anticipatedOrders" 
                      name="Commandes anticipées" 
                      fill="#f97316"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Dernières demandes */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Dernières demandes</h2>
            <Link to="/admin/orders" className="text-sm text-amber-600 hover:underline">
              Voir toutes les demandes →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : orders.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {orders.slice(0, 5).map(order => (
                    <Link 
                      key={order.commandeid}
                      to={`/admin/orders/${order.commandeid}`}
                      className="block px-6 py-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {order.termine === 'Oui' ? (
                            <ListChecks className="h-5 w-5 text-green-500 mr-4" />
                          ) : order.termine === 'En cours' ? (
                            <Clock className="h-5 w-5 text-purple-500 mr-4" />
                          ) : (
                            <FileText className="h-5 w-5 text-amber-500 mr-4" />
                          )}
                          <div>
                            <p className="font-medium">
                              {order.displayTitle || `Demande #${order.commandeid}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              Par {order.clientname} · {order.datecommande ? 
                                format(new Date(order.datecommande), 'dd/MM/yyyy') : 'Date inconnue'}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.termine === 'Oui' 
                              ? 'bg-green-100 text-green-800' 
                              : order.termine === 'En cours'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.termine === 'Oui' ? 'Terminée' : order.termine === 'En cours' ? 'En cours' : 'En attente'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">Aucune demande enregistrée</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

// Composant personnalisé pour le tooltip du graphique d'évolution
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const pending = payload.find((p: any) => p.name === "En attente")?.value || 0;
    const completed = payload.find((p: any) => p.name === "Terminées")?.value || 0;
    const total = pending + completed;
    
    return (
      <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 text-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-amber-600">En attente: {pending}</p>
        <p className="text-green-600">Terminées: {completed}</p>
        <p className="mt-1 pt-1 border-t border-gray-200 font-medium">Total: {total}</p>
      </div>
    );
  }

  return null;
};

// Composant personnalisé pour le tooltip du graphique des ouvriers
const CustomWorkerTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 text-sm">
        <p className="font-semibold">{data.name}</p>
        <p>Commandes anticipées: {data.anticipatedOrders}</p>
        <p>Total commandes: {data.orderCount}</p>
        <p>Total articles: {data.itemCount}</p>
      </div>
    );
  }

  return null;
};

export default Dashboard;
