
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
import { ClipboardList, MessageSquare, Settings, FileDown, Printer } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

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

  const exportToCSV = (order: Order) => {
    const header = ['ID', 'Utilisateur', 'Date', 'Affaire', 'Statut', 'Produit', 'Référence', 'Quantité'];
    let csvContent = header.join(',') + '\n';
    
    // Create a row using the data directly from the order
    const row = [
      order.commandeid,
      order.clientname || '',
      order.datecommande || '',
      '', // No project code in DB schema
      order.termine || '',
      order.produit || '',
      order.reference || '',
      order.quantite || ''
    ].map(value => `"${value}"`).join(',');
    csvContent += row + '\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `commande_${order.commandeid}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let htmlContent = `
      <html>
      <head>
        <title>Demande de Stock #${order.commandeid}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h2 { margin-top: 20px; }
          .header { display: flex; justify-content: space-between; }
          .date { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Demande de stock #${order.commandeid}</h1>
          <p class="date">Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <p>Utilisateur: ${order.clientname || ''}</p>
        <p>Date: ${order.datecommande ? new Date(order.datecommande).toLocaleDateString('fr-FR') : ''}</p>
        <p>Statut: ${order.termine === 'Non' ? 'En attente' : 'Terminée'}</p>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Référence</th>
              <th>Quantité</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.produit || ''}</td>
              <td>${order.reference || ''}</td>
              <td>${order.quantite || ''}</td>
            </tr>
          </tbody>
        </table>
    `;
      
    if (order.messagefournisseur) {
      htmlContent += `
        <p><strong>Message:</strong> ${order.messagefournisseur}</p>
      `;
    }
    
    htmlContent += `
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-4">
      {orders.length > 0 ? (
        orders.map((order) => (
          <Card key={order.commandeid} className={`overflow-hidden ${order.archived ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5 text-gray-500" />
                    Demande #{order.commandeid}
                    {showUser && order.clientname && <span className="ml-2 text-sm font-normal">({order.clientname})</span>}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {order.datecommande ? new Date(order.datecommande).toLocaleDateString('fr-FR') : ''}
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Display the order directly as a single item */}
                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.produit}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{order.reference}</TableCell>
                      <TableCell className="text-right">{order.quantite}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 py-2">
              <div className="flex justify-between w-full text-sm items-center">
                <span>
                  Quantité: <span className="font-semibold">
                    {order.quantite} 
                  </span>
                </span>
                
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => exportToCSV(order)}
                      >
                        <FileDown className="h-4 w-4" />
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => printOrder(order)}
                      >
                        <Printer className="h-4 w-4" />
                        PDF
                      </Button>
                    </>
                  )}
                  
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
