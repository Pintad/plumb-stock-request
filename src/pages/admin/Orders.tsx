
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import OrderList from '@/components/OrderList';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Archive, Eye, EyeOff, Check } from 'lucide-react';
import { Order } from '@/types';

const AdminOrders = () => {
  const { orders, projects, archiveOrder, archiveCompletedOrders, updateOrderStatus } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Filter orders by archive status and project
  const filteredOrders = orders.filter(order => {
    if (showArchived !== !!order.archived) return false;

    if (order.projectCode) {
      if (selectedProject !== "all" && selectedProject !== order.projectCode) return false;
    } else {
      if (selectedProject !== "all" && selectedProject !== "none") return false;
    }
    return true;
  });

  // Handler to validate an order (set terme to 'Oui')
  const handleValidateOrder = (order: Order) => {
    updateOrderStatus(order.commandeid, 'Oui');
  };

  // Component to render action button based on order status
  const renderActionButton = (order: Order) => {
    if (order.terme === 'Non' && !order.archived) {
      // Show "Valider la commande"
      return (
        <Button size="sm" variant="default" onClick={() => handleValidateOrder(order)} className="flex items-center gap-1">
          <Check className="h-4 w-4" />
          Valider la commande
        </Button>
      );
    }
    if (order.terme === 'Oui' && !order.archived) {
      // Show "Archiver" button
      return (
        <Button size="sm" variant="outline" onClick={() => archiveOrder(order.commandeid)} className="flex items-center gap-1">
          <Archive className="h-4 w-4" />
          Archiver
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 container px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {showArchived ? 'Archives' : 'Gestion des demandes'}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2"
            >
              {showArchived ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Masquer les archives
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Voir les archives
                </>
              )}
            </Button>
            {!showArchived && (
              <Button
                variant="outline"
                onClick={() => archiveCompletedOrders()}
                className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Archiver les demandes terminées
              </Button>
            )}
          </div>
        </div>

        <OrderList
          orders={filteredOrders}
          isAdmin={true}
          onManageOrder={() => {}}
          onArchiveOrder={archiveOrder}
        />
      </main>
    </div>
  );
};

export default AdminOrders;
