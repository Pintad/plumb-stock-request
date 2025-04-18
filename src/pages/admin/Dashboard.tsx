
import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { Package, FileText, ClipboardCheck, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { orders, products, user } = useAppContext();
  
  // Nombre de demandes en attente
  const pendingOrders = orders.filter(order => order.termine === 'Non').length;
  
  // Nombre total d'utilisateurs (ouvriers uniquement)
  const workerCount = 3; // Dans une vraie application, ce serait dynamique
  
  const stats = [
    {
      title: 'Produits',
      value: products.length,
      description: 'Total des références',
      icon: <Package className="h-8 w-8 text-blue-500" />,
      link: '/admin/products'
    },
    {
      title: 'Demandes',
      value: orders.length,
      description: `${pendingOrders} en attente`,
      icon: <FileText className="h-8 w-8 text-green-500" />,
      link: '/admin/orders'
    },
    {
      title: 'Ouvriers',
      value: workerCount,
      description: 'Utilisateurs actifs',
      icon: <UserCheck className="h-8 w-8 text-purple-500" />,
      link: '#'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-500 mb-6">Bienvenue, {user?.name}</p>
        
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <Link key={index} to={stat.link} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <CardDescription>{stat.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Dernières demandes</h2>
          {orders.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {orders.slice(0, 5).map(order => (
                    <Link 
                      key={order.commandeid}
                      to="/admin/orders" 
                      className="block px-6 py-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ClipboardCheck className="h-5 w-5 text-gray-400 mr-4" />
                          <div>
                            <p className="font-medium">Demande #{order.commandeid}</p>
                            <p className="text-sm text-gray-500">
                              Par {order.clientname} · {order.datecommande}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm">
                          {order.quantite} articles
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

export default Dashboard;
