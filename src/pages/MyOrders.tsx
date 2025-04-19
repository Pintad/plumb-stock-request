
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import { Order } from '@/types';

const MyOrders = () => {
  const { orders, user, archiveOrder } = useAppContext();
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Filter orders by clientname and archiveclient flag
  const userOrders = orders.filter(order => {
    if (!user) return false;

    // Match clientname and archiveclient flag depending on showArchived state
    // Correct use of archiveclient property with exact camelCase
    return order.clientname === user.name && (showArchived === !!order.archiveclient);
  });

  // Handle "Archiver" for user orders (set archiveclient = true)
  const handleArchiveClientOrder = async (order: Order) => {
    if (!archiveOrder) return;

    try {
      // Use direct Supabase call to set archiveclient = true for this order
      import('@/integrations/supabase/client').then(({ supabase }) => {
        supabase
          .from('commandes')
          .update({ archiveclient: true })
          .eq('commandeid', order.commandeid)
          .then(({ error }) => {
            if (error) {
              console.error("Erreur lors de l'archivage client:", error);
            } else {
              window.location.reload();
            }
          });
      });
    } catch (err) {
      console.error(err);
    }
  };

  const renderActionButton = (order: Order) => {
    if (!order.archiveclient) {
      return (
        <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => handleArchiveClientOrder(order)}>
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
            {showArchived ? 'Mes archives' : 'Mes demandes de stock'}
          </h1>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-archived" 
              checked={showArchived}
              onCheckedChange={(checked) => setShowArchived(!!checked)} 
            />
            <Label htmlFor="show-archived">{showArchived ? 'Afficher les demandes en cours' : 'Afficher les demandes archivées'}</Label>
          </div>
        </div>

        {userOrders.length === 0 ? (
          <p className="text-center text-gray-600">Aucune commande {showArchived ? 'archivée' : 'en cours'}.</p>
        ) : (
          <div className="space-y-4">
            {userOrders.map(order => (
              <div key={order.commandeid} className={`p-4 bg-white rounded shadow ${order.archiveclient ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-semibold text-lg">Demande #{order.commandeid}</div>
                    <div className="text-sm text-gray-600">
                      {order.datecommande ? new Date(order.datecommande).toLocaleDateString('fr-FR') : ''}
                    </div>
                  </div>
                  <div>
                    {renderActionButton(order)}
                  </div>
                </div>
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

export default MyOrders;
