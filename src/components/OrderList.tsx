
import React from 'react';
import { FileText, Printer, Download } from 'lucide-react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrderListProps {
  orders: Order[];
  showFullDetails?: boolean;
}

const OrderList: React.FC<OrderListProps> = ({ orders, showFullDetails = false }) => {
  const handlePrint = (order: Order) => {
    // Ouvre une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Contenu HTML de la fenêtre d'impression
    printWindow.document.write(`
      <html>
        <head>
          <title>Demande de stock #${order.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .summary {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .meta {
              margin-bottom: 20px;
            }
            .meta p {
              margin: 5px 0;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PlumbStock - Demande de stock #${order.id}</h1>
            <div>
              <p><strong>Date:</strong> ${format(new Date(order.date), 'dd MMMM yyyy', { locale: fr })}</p>
            </div>
          </div>
          
          <div class="meta">
            <p><strong>Demandeur:</strong> ${order.userName}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Désignation</th>
                <th>Unité</th>
                <th>Quantité</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.reference}</td>
                  <td>${item.name}</td>
                  <td>${item.unit}</td>
                  <td>${item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <div>
              <p><strong>Total articles:</strong> ${totalItems}</p>
              <p><strong>Total références:</strong> ${order.items.length}</p>
            </div>
            <button onclick="window.print()">Imprimer</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  const handleExport = (order: Order) => {
    // Générer un CSV
    const headers = ["Référence", "Désignation", "Unité", "Quantité"];
    const data = order.items.map(item => [
      item.reference,
      item.name,
      item.unit,
      item.quantity.toString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `demande-${order.id}-${order.date}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">En attente</Badge>;
      case 'processed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">En cours</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">Terminé</Badge>;
      default:
        return null;
    }
  };
  
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-500">Aucune demande trouvée</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {orders.map(order => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="pb-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>Demande #{order.id}</span>
                {renderStatusBadge(order.status)}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm" onClick={() => handlePrint(order)}>
                  <Printer className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Imprimer</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport(order)}>
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Exporter</span>
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1 flex flex-col sm:flex-row sm:items-center">
              <span>
                {format(new Date(order.date), 'dd MMMM yyyy', { locale: fr })}
              </span>
              {showFullDetails && (
                <span className="sm:ml-4">Demandeur: {order.userName}</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Désignation</TableHead>
                    <TableHead className="w-24 text-right">Quantité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map(item => (
                    <TableRow key={`${order.id}-${item.id}`}>
                      <TableCell className="font-mono text-sm">{item.reference}</TableCell>
                      <TableCell>
                        <div>
                          <div>{item.name}</div>
                          <div className="text-xs text-gray-500">{item.unit}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderList;
