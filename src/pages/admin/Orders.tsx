
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import OrderList from '@/components/OrderList';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OrderManager from '@/components/OrderManager';
import { Order } from '@/types';

const AdminOrders = () => {
  const { orders, projects, updateOrder } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Filter orders by project if a project is selected
  const filteredOrders = selectedProject === "all" 
    ? orders 
    : orders.filter(order => 
        selectedProject === "none" 
          ? !order.projectCode 
          : order.projectCode === selectedProject);

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
