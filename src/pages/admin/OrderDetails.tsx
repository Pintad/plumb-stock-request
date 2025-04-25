
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Archive, 
  FileDown, 
  Printer,
  CheckCircle,
  Circle,
  Clock
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Order, CartItem } from '@/types';
import { Switch } from "@/components/ui/switch";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, archiveOrder, updateOrder, updateOrderStatus, isAdmin } = useAppContext();

  const [order, setOrder] = useState<Order | undefined>(
    orders.find(o => o.commandeid === orderId)
  );
  
  const [messageText, setMessageText] = useState<string>("");
  const [articles, setArticles] = useState<CartItem[]>([]);
  
  // Initialize articles state from order
  useEffect(() => {
    if (order) {
      // Initialize articles, ensuring each has a completed property
      const updatedArticles = order.articles.map(article => ({
        ...article,
        completed: article.completed || false
      }));
      setArticles(updatedArticles);
      setMessageText(order.messagefournisseur || "");
    }
  }, [order, orders]);

  // Update local order when orders change in context
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
    
    // Update order status based on article completion
    updateOrderBasedOnArticles(updatedArticles);
  };

  const updateOrderBasedOnArticles = (updatedArticles: CartItem[]) => {
    if (!order) return;
    
    // Determine order status based on article completion
    let newStatus = 'Non';
    
    const allCompleted = updatedArticles.every(article => article.completed);
    const anyCompleted = updatedArticles.some(article => article.completed);
    
    if (allCompleted) {
      newStatus = 'Oui';
    } else if (anyCompleted) {
      newStatus = 'En cours';
    }
    
    // Create updated order
    const updatedOrder: Order = {
      ...order,
      articles: updatedArticles,
      termine: newStatus
    };
    
    // Update in context
    updateOrder(updatedOrder);
    
    // Update in database
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

  const getStatusIcon = (status: string) => {
    if (status === 'Oui') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'En cours') return <Clock className="h-4 w-4 text-yellow-500" />;
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'Oui') return 'bg-green-500';
    if (status === 'En cours') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const formatStatus = (status: string) => {
    if (status === 'Oui') return 'Terminée';
    if (status === 'En cours') return 'En cours';
    return 'En attente';
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
              className={`${getStatusBadgeClass(order.termine)} text-white flex items-center gap-1`}
            >
              {getStatusIcon(order.termine)}
              {formatStatus(order.termine)}
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

              {isAdmin && (
                <div>
                  <div className="flex justify-between items-center border-t pt-4 mb-2">
                    <p className="font-medium">Statut de la commande</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {formatStatus(order.termine)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleManualStatusChange('Non')}>
                          En attente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManualStatusChange('En cours')}>
                          En cours
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManualStatusChange('Oui')}>
                          Terminée
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Articles</p>
                {isAdmin ? (
                  <div className="space-y-2">
                    {articles.map((article, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={article.completed} 
                            onCheckedChange={() => handleItemCompletionToggle(index)}
                            id={`article-${index}`}
                          />
                          <label 
                            htmlFor={`article-${index}`}
                            className={`flex-grow cursor-pointer ${article.completed ? 'line-through text-gray-500' : ''}`}
                          >
                            <div className="font-medium">{article.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Réf: {article.reference} - Qté: {article.quantity}
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Produit</th>
                          <th className="px-4 py-2 text-left">Référence</th>
                          <th className="px-4 py-2 text-right">Quantité</th>
                          <th className="px-4 py-2 text-center">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {articles.map((article, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{article.name}</td>
                            <td className="px-4 py-2 font-mono text-sm">{article.reference}</td>
                            <td className="px-4 py-2 text-right">{article.quantity}</td>
                            <td className="px-4 py-2 text-center">
                              {article.completed ? (
                                <Badge className="bg-green-500">Validé</Badge>
                              ) : (
                                <Badge className="bg-gray-300 text-gray-700">En attente</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="border-t pt-4">
                  <div className="mb-2">
                    <p className="font-medium mb-1">Message du magasinier</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ajoutez un commentaire ou une précision pour cette commande
                    </p>
                    <Textarea 
                      value={messageText}
                      onChange={handleMessageChange}
                      placeholder="Ex: Produit manquant, laissé un mot au client..."
                      className="min-h-24"
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button onClick={handleSaveMessage}>
                      Enregistrer le message
                    </Button>
                  </div>
                </div>
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
