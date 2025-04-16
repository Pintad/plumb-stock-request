
import React from 'react';
import { Header } from '@/components/Header';
import OrderList from '@/components/OrderList';
import { useAppContext } from '@/context/AppContext';

const MyOrders = () => {
  const { orders, user } = useAppContext();
  
  // Filtrer les commandes pour n'afficher que celles de l'utilisateur actuel
  const userOrders = orders.filter(order => order.userId === user?.id);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Mes demandes de stock</h1>
        
        <OrderList orders={userOrders} />
      </main>
    </div>
  );
};

export default MyOrders;
