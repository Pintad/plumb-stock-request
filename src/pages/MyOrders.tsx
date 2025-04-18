
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import OrderList from '@/components/OrderList';
import { useAppContext } from '@/context/AppContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const MyOrders = () => {
  const { orders, user } = useAppContext();
  const [showArchived, setShowArchived] = useState<boolean>(false);
  
  // Filter orders to show only those of the current user and control archived visibility
  const userOrders = orders.filter(order => {
    // Match by clientname instead of userId
    return (order.clientname === user?.name) && (showArchived || !order.archived);
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mes demandes de stock</h1>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-archived" 
              checked={showArchived}
              onCheckedChange={(checked) => setShowArchived(!!checked)} 
            />
            <Label htmlFor="show-archived">Afficher les demandes archivées</Label>
          </div>
        </div>
        
        <OrderList orders={userOrders} />
      </main>
    </div>
  );
};

export default MyOrders;
