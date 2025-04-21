
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

interface OrderListItemProps {
  order: Order;
  showUser?: boolean;
  isAdmin?: boolean;
  projectName?: string | null;
  onManageOrder?: (order: Order) => void;
  onExportCSV: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
  onArchiveOrder?: (orderId: string) => Promise<boolean>;
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
  projectName,
  onManageOrder,
  onExportCSV,
  onPrintOrder,
  onArchiveOrder
}: OrderListItemProps) => {
  return (
    <Card className={`overflow-hidden ${order.archived ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-gray-500" />
              {order.displayTitle ? (
                <span>{order.displayTitle}</span>
              ) : (
                <span>Demande #{order.commandeid}</span>
              )}
              {showUser && order.clientname && (
                <span className="ml-2 text-sm font-normal">({order.clientname})</span>
              )}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {order.datecommande ? new Date(order.datecommande).toLocaleDateString('fr-FR') : ''}
            </p>
            {(order.projectCode || order.projectName) && (
              <div className="mt-1">
                <Badge variant="outline" className="font-normal">
                  Affaire: {order.projectCode} 
                  {order.projectName ? ` - ${order.projectName}` : projectName ? ` - ${projectName}` : ''}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {order.messagefournisseur && !isAdmin && (
              <div className="flex items-center text-sm text-gray-600 mr-2">
                <MessageSquare className="h-4 w-4 mr-1" />
                {order.messagefournisseur}
              </div>
            )}
            <Badge className={`${getStatusColor(order.termine)} text-white`}>
              {getStatusLabel(order.termine)}
            </Badge>
            {order.archived && (
              <Badge variant="outline" className="bg-gray-200">
                Archivée
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <OrderArticlesList articles={order.articles} />
      </CardContent>
      <CardFooter className="bg-gray-50 py-2">
        <div className="flex justify-between w-full text-sm items-center">
          <span>
            Articles: <span className="font-semibold">
              {order.articles?.length || 0}
            </span>
          </span>
          
          <OrderActions 
            order={order}
            isAdmin={isAdmin}
            onManageOrder={onManageOrder}
            onExportCSV={onExportCSV}
            onPrintOrder={onPrintOrder}
            onArchiveOrder={onArchiveOrder ? (order) => onArchiveOrder(order.commandeid) : undefined}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderListItem;
