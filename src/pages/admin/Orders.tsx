
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
  const { orders, projects, archiveOrder, archiveCompletedOrders } = useAppContext();
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

    // Only orders where archive=false or archive=true based on showArchived state
    return true;
  });

  // Handler to validate an order (set termine to 'Oui')
  const { updateOrderStatus } = useAppContext();

  const handleValidateOrder = (order: Order) => {
    updateOrderStatus(order.commandeid, 'Oui');
  };

  // Component to render action button based on order status
  const renderActionButton = (order: Order) => {
    if (order.termine === 'Non' && !order.archived) {
      // Show "Valider la commande"
      return (
        <Button size="sm" variant="default" onClick={() => handleValidateOrder(order)} className="flex items-center gap-1">
          <Check className="h-4 w-4" />
          Valider la commande
        </Button>
      );
    }
    if (order.termine === 'Oui' && !order.archived) {
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

        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-600">Aucune commande disponible.</p>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.commandeid} className={`p-4 bg-white rounded shadow ${order.archived ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-semibold text-lg">Demande #{order.commandeid}</div>
                    <div className="text-sm text-gray-600">
                      {order.datecommande ? new Date(order.datecommande).toLocaleDateString('fr-FR') : ''}
                    </div>
                    {order.projectCode && (
                      <div className="text-sm mt-1">
                        Affaire: {order.projectCode} {projects.find(p => p.code === order.projectCode)?.name || ''}
                      </div>
                    )}
                  </div>
                  <div>
                    {renderActionButton(order)}
                  </div>
                </div>
                {/* Articles list preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    Articles: {order.articles.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;

