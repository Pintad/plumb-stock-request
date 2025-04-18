
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import OrderList from '@/components/OrderList';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import OrderManager from '@/components/OrderManager';
import { Order } from '@/types';

const AdminOrders = () => {
  const { orders, projects, updateOrder } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  
  // Filter orders by project and archived status
  const filteredOrders = orders.filter(order => {
    // Filter by archived status
    if (!showArchived && order.archived) return false;
    
    // Filter by project (using the frontend projectCode field)
    if (order.projectCode) {
      return selectedProject === "all" || selectedProject === order.projectCode;
    } else {
      return selectedProject === "all" || selectedProject === "none";
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des demandes</h1>
        
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
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-archived" 
                  checked={showArchived}
                  onCheckedChange={(checked) => setShowArchived(!!checked)} 
                />
                <Label htmlFor="show-archived">Afficher les demandes archivées</Label>
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
            isAdmin={true}
          />
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
