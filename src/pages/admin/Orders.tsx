import React, { useState } from 'react';
import { Header } from '@/components/Header';
import OrderList from '@/components/OrderList';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Archive, Eye, EyeOff } from 'lucide-react';
import { Order } from '@/types';
import OrderManager from '@/components/OrderManager';

const AdminOrders = () => {
  const { orders, projects, archiveOrder, archiveCompletedOrders } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  
  const filteredOrders = orders.filter(order => {
    if (showArchived !== order.archived) return false;
    
    if (order.projectCode) {
      if (selectedProject !== "all" && selectedProject !== order.projectCode) return false;
    } else {
      if (selectedProject !== "all" && selectedProject !== "none") return false;
    }

    return true;
  });

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
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full md:w-80">
                <label className="block text-sm font-medium mb-2">Filtrer par affaire</label>
                <Select 
                  value={selectedProject} 
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes les affaires" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les affaires</SelectItem>
                    <SelectItem value="none">Sans affaire</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.code}>
                        {project.code} - {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {selectedOrder ? (
          <OrderManager 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        ) : (
          <OrderList 
            orders={filteredOrders} 
            showUser={true} 
            showFullDetails={true} 
            onManageOrder={setSelectedOrder}
            onArchiveOrder={archiveOrder}
            isAdmin={true}
          />
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
