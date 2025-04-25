
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Archive, FileDown, Printer } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import OrderManager from '@/components/OrderManager';
import OrderArticlesList from '@/components/orders/OrderArticlesList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, archiveOrder } = useAppContext();

  const order = orders.find(o => o.commandeid === orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="flex-1 container px-4 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/orders')}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <p>Commande non trouvée</p>
        </main>
      </div>
    );
  }

  const handleArchive = async () => {
    if (await archiveOrder(order.commandeid)) {
      navigate('/admin/orders');
    }
  };

  const exportToCSV = () => {
    const header = ['ID', 'Utilisateur', 'Date', 'Affaire', 'Statut', 'Produit', 'Référence', 'Quantité'];
    let csvContent = header.join(',') + '\n';
    
    order.articles.forEach(article => {
      const row = [
        order.commandeid,
        order.clientname || '',
        order.datecommande || '',
        order.projectCode || '', 
        order.termine || '',
        article.name || '',
        article.reference || '',
        article.quantity || '0'
      ].map(value => `"${value}"`).join(',');
      csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `commande_${order.commandeid}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printOrder = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let htmlContent = `
      <html>
      <head>
        <title>${order.displayTitle || `Demande de Stock #${order.commandeid}`}</title>
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
          <h1>${order.displayTitle || `Demande de stock #${order.commandeid}`}</h1>
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
    `;
    
    order.articles.forEach(article => {
      htmlContent += `
        <tr>
          <td>${article.name || ''}</td>
          <td>${article.reference || ''}</td>
          <td>${article.quantity || '0'}</td>
        </tr>
      `;
    });
    
    htmlContent += `
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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 container px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              {order.displayTitle || `Commande #${order.commandeid}`}
            </CardTitle>
            <Badge 
              className={`${order.termine === 'Non' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}
            >
              {order.termine === 'Non' ? 'En attente' : 'Terminée'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{order.clientname}</p>
              </div>
              
              {order.projectCode && (
                <div>
                  <p className="text-sm text-muted-foreground">Affaire</p>
                  <p className="font-medium">{order.projectCode}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {order.datecommande ? new Date(order.datecommande).toLocaleDateString('fr-FR') : 'Non définie'}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Articles</p>
                <OrderArticlesList articles={order.articles} />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={exportToCSV}
                >
                  <FileDown className="h-4 w-4" />
                  Exporter CSV
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={printOrder}
                >
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>

                {order.termine === 'Oui' && !order.archived && (
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleArchive}
                  >
                    <Archive className="h-4 w-4" />
                    Archiver
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderDetails;
