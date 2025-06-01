
import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import StatCards from '@/components/admin/dashboard/StatCards';
import OrdersChart from '@/components/admin/dashboard/OrdersChart';
import TopRequestersChart from '@/components/admin/dashboard/TopRequestersChart';
import TopItemsList from '@/components/admin/dashboard/TopItemsList';
import RecentOrders from '@/components/admin/dashboard/RecentOrders';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { orders, products, user, loadOrders, isLoading } = useAppContext();
  const isMobile = useIsMobile();
  
  // Charger les commandes lorsque le tableau de bord se monte
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Utiliser le hook personnalisé pour préparer les données du dashboard
  const {
    orderStats,
    topItemsData,
    topRequestersData,
    ordersByDateData,
    chartConfig
  } = useDashboardData(orders, products);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className={`flex-1 container ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>Tableau de bord</h1>
        <p className={`text-gray-500 ${isMobile ? 'mb-4 text-sm' : 'mb-6'}`}>Bienvenue, {user?.name}</p>
        
        {/* Cartes de statistiques principales */}
        <StatCards 
          pendingOrders={orderStats.pendingOrders}
          inProgressOrders={orderStats.inProgressOrders}
          completedOrders={orderStats.completedOrders}
          totalItems={orderStats.totalItems}
          isMobile={isMobile}
        />
        
        {/* Graphiques et analyses */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4 mt-6' : 'lg:grid-cols-2 gap-6 mt-8'}`}>
          {/* Graphique des commandes sur les 14 derniers jours */}
          <OrdersChart 
            ordersByDateData={ordersByDateData}
            chartConfig={chartConfig}
            isMobile={isMobile}
          />
          
          {/* Graphique des ouvriers qui anticipent le plus */}
          <TopRequestersChart 
            topRequestersData={topRequestersData}
            chartConfig={chartConfig}
            isMobile={isMobile}
          />
        </div>
        
        {/* Articles les plus commandés */}
        <TopItemsList 
          topItemsData={topItemsData}
          isLoading={isLoading}
          isMobile={isMobile}
        />
        
        {/* Dernières demandes */}
        <RecentOrders 
          orders={orders}
          isLoading={isLoading}
          isMobile={isMobile}
        />
      </main>
    </div>
  );
};

export default Dashboard;
