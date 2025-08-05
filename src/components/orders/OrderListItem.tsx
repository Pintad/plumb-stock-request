
import React from 'react';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClipboardList, MessageSquare } from 'lucide-react';
import OrderArticlesList from './OrderArticlesList';
import OrderActions from './OrderActions';
import { useIsMobile } from '@/hooks/use-mobile';

interface OrderListItemProps {
  order: Order;
  showUser?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  projectName?: string | null;
  onManageOrder?: (order: Order) => void;
  onExportCSV: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
}

const getStatusColor = (termineValue: string | null | undefined) => {
  if (!termineValue) return 'bg-gray-500';
  switch (termineValue) {
    case 'Non':
      return 'bg-yellow-500';
    case 'Oui':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusLabel = (termineValue: string | null | undefined) => {
  if (!termineValue) return 'Non défini';
  switch (termineValue) {
    case 'Non':
      return 'En attente';
    case 'Oui':
      return 'Terminée';
    default:
      return termineValue;
  }
};

const OrderListItem = ({ 
  order, 
  showUser = false, 
  isAdmin = false,
  isSuperAdmin = false,
  projectName,
  onManageOrder,
  onExportCSV,
  onPrintOrder
}: OrderListItemProps) => {
  const isMobile = useIsMobile();
  
  // Always use the DB-stored display title without any fallbacks
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
    <Card className={`overflow-hidden ${order.archived ? 'opacity-70' : ''}`}>
      <CardHeader className={`${isMobile ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-between items-start'}`}>
          <div>
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} flex items-center`}>
              <ClipboardList className="mr-2 h-5 w-5 text-gray-500" />
              <span className={`${isMobile ? 'truncate max-w-[200px]' : ''}`}>
                {displayTitle}
              </span>
              {showUser && order.clientname && !isMobile && (
                <span className="ml-2 text-sm font-normal">({order.clientname})</span>
              )}
            </CardTitle>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
              {formattedDate}
              {showUser && order.clientname && isMobile && (
                <> • {order.clientname}</>
              )}
            </p>
            {(order.projectCode || order.projectName) && (
              <div className={`${isMobile ? 'mt-1' : 'mt-1'}`}>
                <Badge variant="outline" className={`font-normal ${isMobile ? 'text-xs py-0 px-1.5' : ''}`}>
                  Affaire: {order.projectCode} 
                  {!isMobile && order.projectName ? ` - ${order.projectName}` : ''}
                  {!isMobile && projectName ? ` - ${projectName}` : ''}
                </Badge>
              </div>
            )}
          </div>
          <div className={`flex items-center gap-2 ${isMobile ? 'mt-2 justify-between w-full' : ''}`}>
            {order.messagefournisseur && !(isAdmin || isSuperAdmin) && (
              <div className={`flex items-center text-sm text-gray-600 ${isMobile ? 'text-xs' : 'mr-2'}`}>
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className={isMobile ? 'truncate max-w-[150px]' : ''}>
                  {order.messagefournisseur}
                </span>
              </div>
            )}
            <Badge className={`${getStatusColor(order.termine)} text-white ${isMobile ? 'text-xs px-1.5' : ''}`}>
              {getStatusLabel(order.termine)}
            </Badge>
            {order.archived && (
              <Badge variant="outline" className={`bg-gray-200 ${isMobile ? 'text-xs' : ''}`}>
                Archivée
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={isMobile ? 'py-2 px-3' : ''}>
        <OrderArticlesList articles={order.articles} />
      </CardContent>
      <CardFooter className={`bg-gray-50 ${isMobile ? 'py-2 px-3' : 'py-2'}`}>
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between'} w-full text-sm items-center`}>
          <span className={isMobile ? 'self-start text-xs' : ''}>
            Articles: <span className="font-semibold">
              {order.articles?.length || 0}
            </span>
          </span>
          
          <OrderActions 
            order={order}
            isAdmin={isAdmin}
            isSuperAdmin={isSuperAdmin}
            onManageOrder={onManageOrder}
            onExportCSV={onExportCSV}
            onPrintOrder={onPrintOrder}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderListItem;
