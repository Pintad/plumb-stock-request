
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types';
import OrderInfoSection from './OrderInfoSection';
import OrderArticlesList from './OrderArticlesList';

interface OrderDetailsReadOnlyProps {
  order: Order;
  backUrl: string;
}

const OrderDetailsReadOnly = ({ order, backUrl }: OrderDetailsReadOnlyProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 container px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(backUrl)}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {order.displayTitle || `Commande #${order.commandeid}`}
            </CardTitle>
            <div className="mt-2">
              <span className={`inline-flex px-2 py-1 rounded-full text-sm ${
                order.termine === 'Non' ? 'bg-yellow-100 text-yellow-800' : 
                order.termine === 'En cours' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {order.termine === 'Non' ? 'En attente' : 
                 order.termine === 'En cours' ? 'En cours' : 'Terminée'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <OrderInfoSection order={order} />
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Articles</h3>
                <OrderArticlesList articles={order.articles} />
              </div>
              
              {order.messagefournisseur && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-2">Message du magasinier</h3>
                  <p className="text-gray-600">{order.messagefournisseur}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderDetailsReadOnly;
