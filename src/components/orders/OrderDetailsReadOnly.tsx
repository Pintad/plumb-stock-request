
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
  isMobile?: boolean;
}

const OrderDetailsReadOnly = ({ order, backUrl, isMobile }: OrderDetailsReadOnlyProps) => {
  const navigate = useNavigate();
  
  // Utiliser uniquement le titre d'affichage stocké en base, sans fallback
  const displayTitle = order.titre_affichage || "[ERREUR: Titre manquant]";

  // Format de la date SANS l'heure
  const formattedDate = order.datecommande 
    ? new Date(order.datecommande).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      }) 
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className={`flex-1 container ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
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
            <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
              {displayTitle}
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
              <span className="ml-2 text-sm text-gray-500">{formattedDate}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <OrderInfoSection order={order} />
              
              <div className="border-t pt-6">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-4`}>Articles</h3>
                <OrderArticlesList articles={order.articles} isMobile={isMobile} />
              </div>
              
              {order.messagefournisseur && (
                <div className="border-t pt-6">
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2`}>Message du magasinier</h3>
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
