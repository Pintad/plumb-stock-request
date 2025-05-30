
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { ListChecks, Clock, FileText } from 'lucide-react';
import { Order } from '@/types';

interface RecentOrdersProps {
  orders: Order[];
  isLoading: boolean;
  isMobile?: boolean;
}

const RecentOrders = ({ orders, isLoading, isMobile = false }: RecentOrdersProps) => {
  return (
    <div className={isMobile ? 'mt-6' : 'mt-8'}>
      <div className={`flex justify-between items-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Dernières demandes</h2>
        <Link to="/admin/orders" className={`${isMobile ? 'text-xs' : 'text-sm'} text-amber-600 hover:underline`}>
          Voir toutes les demandes →
        </Link>
      </div>
      
      {isLoading ? (
        <div className={`flex justify-center ${isMobile ? 'py-8' : 'py-12'}`}>
          <div className={`animate-spin rounded-full ${isMobile ? 'h-8 w-8' : 'h-12 w-12'} border-b-2 border-gray-900`}></div>
        </div>
      ) : orders.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {orders.slice(0, 5).map(order => (
                <Link 
                  key={order.commandeid}
                  to={`/admin/orders/${order.commandeid}`}
                  className={`block ${isMobile ? 'px-3 py-3' : 'px-6 py-4'} hover:bg-gray-50`}
                >
                  <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-2' : ''}`}>
                    <div className={`flex items-center ${isMobile ? 'w-full' : ''}`}>
                      {order.termine === 'Oui' ? (
                        <ListChecks className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-500 ${isMobile ? 'mr-2' : 'mr-4'}`} />
                      ) : order.termine === 'En cours' ? (
                        <Clock className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-500 ${isMobile ? 'mr-2' : 'mr-4'}`} />
                      ) : (
                        <FileText className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-amber-500 ${isMobile ? 'mr-2' : 'mr-4'}`} />
                      )}
                      <div className={isMobile ? 'flex-1' : ''}>
                        <p className={`font-medium ${isMobile ? 'text-sm truncate' : ''}`}>
                          {order.displayTitle || `Demande #${order.commandeid}`}
                        </p>
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                          Par {order.clientname} · {order.datecommande ? 
                            format(new Date(order.datecommande), 'dd/MM/yyyy') : 'Date inconnue'}
                        </p>
                      </div>
                    </div>
                    <div className={`${isMobile ? 'text-xs self-end' : 'text-sm'}`}>
                      <span className={`px-2 py-1 rounded-full ${isMobile ? 'text-xs' : 'text-xs'} ${
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
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <p className={`text-center text-gray-500 ${isMobile ? 'text-sm' : ''}`}>Aucune demande enregistrée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecentOrders;
