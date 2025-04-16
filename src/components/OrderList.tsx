
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClipboardList, MessageSquare, Settings } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'processed':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusLabel = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'processed':
      return 'En cours';
    case 'completed':
      return 'Terminée';
    default:
      return status;
  }
};

interface OrderListProps {
  orders: Order[];
  showUser?: boolean;
  showFullDetails?: boolean;
  onManageOrder?: (order: Order) => void;
  isAdmin?: boolean;
}

const OrderList = ({ 
  orders, 
  showUser = false, 
  showFullDetails = false,
  onManageOrder,
  isAdmin = false
}: OrderListProps) => {
  const { projects } = useAppContext();
  
  const getProjectName = (code?: string) => {
    if (!code) return null;
    const project = projects.find(p => p.code === code);
    return project ? project.name : code;
  };

  return (
    <div className="space-y-4">
      {orders.length > 0 ? (
        orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5 text-gray-500" />
                    Demande #{order.id}
                    {showUser && <span className="ml-2 text-sm font-normal">({order.userName})</span>}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('fr-FR')}
                  </p>
                  {order.projectCode && (
                    <div className="mt-1">
                      <Badge variant="outline" className="font-normal">
                        Affaire: {order.projectCode} 
                        {getProjectName(order.projectCode) && ` - ${getProjectName(order.projectCode)}`}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {order.message && !isAdmin && (
                    <div className="flex items-center text-sm text-gray-600 mr-2">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {order.message}
                    </div>
                  )}
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      {isAdmin && order.items.some(item => item.completed) && (
                        <TableHead>Statut</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={`${order.id}-${item.id}`}>
                        <TableCell>
                          <div className={item.completed ? "line-through text-gray-400" : ""}>
                            <div className="font-medium">{item.name}</div>
                            {item.category && <div className="text-xs text-gray-500">Catégorie: {item.category}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{item.reference}</TableCell>
                        <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                        {isAdmin && order.items.some(item => item.completed) && (
                          <TableCell>
                            {item.completed ? 
                              <span className="text-green-500 text-sm">Terminé</span> : 
                              <span className="text-gray-400 text-sm">En attente</span>
                            }
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 py-2">
              <div className="flex justify-between w-full text-sm items-center">
                <span>
                  Total: <span className="font-semibold">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} articles
                  </span>
                </span>
                
                {isAdmin && onManageOrder && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => onManageOrder(order)}
                  >
                    <Settings className="h-4 w-4" />
                    Gérer
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="py-12 text-center">
          <div className="rounded-full bg-gray-200 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-medium mb-2">Aucune demande</h2>
          <p className="text-gray-500">
            Vous n'avez aucune demande de stock pour le moment
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderList;
