import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Archive, FileDown, Printer } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem, Order } from '@/types';
import OrderStatusSection from '@/components/orders/OrderStatusSection';
import OrderInfoSection from '@/components/orders/OrderInfoSection';
import OrderArticlesSection from '@/components/orders/OrderArticlesSection';
import MessageSection from '@/components/orders/MessageSection';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, archiveOrder, updateOrder, updateOrderStatus, isAdmin } = useAppContext();

  const [order, setOrder] = useState<Order | undefined>(
    orders.find(o => o.commandeid === orderId)
  );
  
  const [messageText, setMessageText] = useState<string>("");
  const [articles, setArticles] = useState<CartItem[]>([]);
  
  useEffect(() => {
    if (order) {
      const updatedArticles = order.articles.map(article => ({
        ...article,
        completed: article.completed || false
      }));
      setArticles(updatedArticles);
      setMessageText(order.messagefournisseur || "");
    }
  }, [order, orders]);

  useEffect(() => {
    const currentOrder = orders.find(o => o.commandeid === orderId);
    if (currentOrder) {
      setOrder(currentOrder);
    }
  }, [orderId, orders]);

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

  const handleItemCompletionToggle = (index: number) => {
    const updatedArticles = [...articles];
    updatedArticles[index].completed = !updatedArticles[index].completed;
    setArticles(updatedArticles);
    
    updateOrderBasedOnArticles(updatedArticles);
  };

  const updateOrderBasedOnArticles = (updatedArticles: CartItem[]) => {
    if (!order) return;
    
    let newStatus = 'Non';
    
    const allCompleted = updatedArticles.every(article => article.completed);
    const anyCompleted = updatedArticles.some(article => article.completed);
    
    if (allCompleted) {
      newStatus = 'Oui';
    } else if (anyCompleted) {
      newStatus = 'En cours';
    }
    
    const updatedOrder: Order = {
      ...order,
      articles: updatedArticles,
      termine: newStatus
    };
    
    updateOrder(updatedOrder);
    
    updateOrderStatus(order.commandeid, newStatus, messageText);
  };

  const handleManualStatusChange = async (status: string) => {
    if (!order) return;
    
    const updatedOrder: Order = {
      ...order,
      termine: status
    };
    
    updateOrder(updatedOrder);
    await updateOrderStatus(order.commandeid, status, messageText);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
  };

  const handleSaveMessage = async () => {
    if (!order) return;
    
    const updatedOrder: Order = {
      ...order,
      messagefournisseur: messageText
    };
    
    updateOrder(updatedOrder);
    await updateOrderStatus(order.commandeid, order.termine, messageText);
  };

  const exportToCSV = () => {
    const header = ['ID', 'Utilisateur', 'Date', 'Affaire', 'Statut', 'Produit', 'Référence', 'Quantité', 'Complété'];
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
        article.quantity || '0',
        article.completed ? 'Oui' : 'Non'
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
          .completed { color: green; }
          .pending { color: orange; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${order.displayTitle || `Demande de stock #${order.commandeid}`}</h1>
          <p class="date">Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <p>Utilisateur: ${order.clientname || ''}</p>
        <p>Date: ${order.datecommande ? new Date(order.datecommande).toLocaleDateString('fr-FR') : ''}</p>
        <p>Statut: ${order.termine === 'Non' ? 'En attente' : order.termine === 'Oui' ? 'Terminée' : 'En cours'}</p>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Référence</th>
              <th>Quantité</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    articles.forEach(article => {
      htmlContent += `
        <tr>
          <td>${article.name || ''}</td>
          <td>${article.reference || ''}</td>
          <td>${article.quantity || '0'}</td>
          <td class="${article.completed ? 'completed' : 'pending'}">
            ${article.completed ? 'Validé' : 'En attente'}
          </td>
        </tr>
      `;
    });
    
    htmlContent += `
          </tbody>
        </table>
    `;
    
    if (messageText) {
      htmlContent += `
        <p><strong>Message du magasinier:</strong> ${messageText}</p>
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
            <OrderStatusSection 
              status={order.termine}
              isAdmin={isAdmin}
              onStatusChange={handleManualStatusChange}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <OrderInfoSection order={order} />
              
              <OrderArticlesSection 
                articles={articles}
                isAdmin={isAdmin}
                onItemCompletionToggle={handleItemCompletionToggle}
              />

              {isAdmin && (
                <MessageSection 
                  message={messageText}
                  onChange={handleMessageChange}
                  onSave={handleSaveMessage}
                />
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
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

                {order.termine === 'Oui' && !order.archived && isAdmin && (
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
