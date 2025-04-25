
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Archive, Eye, EyeOff } from 'lucide-react';
import OrderListItemCompact from '@/components/orders/OrderListItemCompact';
import { useAppContext } from '@/context/AppContext';

const AdminOrders = () => {
  const { orders, projects, archiveCompletedOrders, loadOrders, isLoading } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Charger les commandes lorsque la page se monte
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <OrderListItemCompact
                key={order.commandeid}
                order={order}
                onClick={() => navigate(`/admin/orders/${order.commandeid}`)}
              />
            ))}
            {filteredOrders.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Aucune commande trouvée
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
