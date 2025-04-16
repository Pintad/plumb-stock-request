
import React from 'react';
import { Header } from '@/components/Header';
import OrderList from '@/components/OrderList';
import { useAppContext } from '@/context/AppContext';

const AdminOrders = () => {
  const { orders } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des demandes</h1>
        
        <OrderList orders={orders} showFullDetails={true} />
      </main>
    </div>
  );
};

export default AdminOrders;
