
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { ListChecks, Clock, FileText } from 'lucide-react';
import { Order } from '@/types';

interface RecentOrdersProps {
  orders: Order[];
  isLoading: boolean;
}

const RecentOrders = ({ orders, isLoading }: RecentOrdersProps) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Dernières demandes</h2>
        <Link to="/admin/orders" className="text-sm text-amber-600 hover:underline">
          Voir toutes les demandes →
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : orders.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {orders.slice(0, 5).map(order => (
                <Link 
                  key={order.commandeid}
                  to={`/admin/orders/${order.commandeid}`}
                  className="block px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {order.termine === 'Oui' ? (
                        <ListChecks className="h-5 w-5 text-green-500 mr-4" />
                      ) : order.termine === 'En cours' ? (
                        <Clock className="h-5 w-5 text-purple-500 mr-4" />
                      ) : (
                        <FileText className="h-5 w-5 text-amber-500 mr-4" />
                      )}
                      <div>
                        <p className="font-medium">
                          {order.displayTitle || `Demande #${order.commandeid}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Par {order.clientname} · {order.datecommande ? 
                            format(new Date(order.datecommande), 'dd/MM/yyyy') : 'Date inconnue'}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.termine === 'Oui' 
                          ? 'bg-green-100 text-green-800' 
                          : order.termine === 'En cours'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.termine === 'Oui' ? 'Terminée' : order.termine === 'En cours' ? 'En cours' : 'En attente'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Aucune demande enregistrée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecentOrders;
