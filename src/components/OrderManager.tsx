
import React, { useState } from 'react';
import { Order, CartItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, CheckCircle, Save, FileDown, Printer, Archive } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import { toast } from '@/components/ui/use-toast';

interface OrderManagerProps {
  order: Order;
  onClose: () => void;
}

const OrderManager: React.FC<OrderManagerProps> = ({ order, onClose }) => {
  const { updateOrder, archiveOrder } = useAppContext();
  const [message, setMessage] = useState<string>(order.message || '');
  const [items, setItems] = useState<CartItem[]>(
    order.items.map(item => ({
      ...item,
      completed: item.completed || false
    }))
  );

  const handleItemCompletion = (itemId: string, completed: boolean) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, completed } : item
      )
    );
  };

  const allItemsCompleted = items.every(item => item.completed);

  const saveChanges = () => {
    const updatedOrder: Order = {
      ...order,
      items: items,
      message,
      status: allItemsCompleted ? 'completed' : (items.some(item => item.completed) ? 'processed' : 'pending')
    };
    
    updateOrder(updatedOrder);
    toast({
      title: "Demande mise à jour",
      description: "Les changements ont été enregistrés",
    });
    onClose();
  };

  const handleArchiveOrder = async () => {
    if (order.status === 'completed') {
      const success = await archiveOrder(order.id);
      if (success) {
        onClose();
      }
    }
  };

  const getProjectName = (code?: string) => {
    if (!code) return null;
    const { projects } = useAppContext();
    const project = projects.find(p => p.code === code);
    return project ? project.name : code;
  };
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processed': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processed': return 'En cours';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  const exportToCSV = () => {
    const header = ['ID', 'Utilisateur', 'Date', 'Affaire', 'Statut', 'Produit', 'Référence', 'Quantité', 'Unité'];
    let csvContent = header.join(',') + '\n';
    
    order.items.forEach(item => {
      const row = [
        order.id,
        order.userName,
        order.date,
        order.projectCode || 'Sans affaire',
        order.status,
        item.name,
        item.reference,
        item.quantity,
        item.unit
      ].map(value => `"${value}"`).join(',');
      csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `commande_${order.id}_${new Date().toISOString().split('T')[0]}.csv`);
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
        <title>Demande de Stock #${order.id}</title>
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
          <h1>Demande de stock #${order.id}</h1>
          <p class="date">Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <p>Utilisateur: ${order.userName}</p>
        <p>Date: ${new Date(order.date).toLocaleDateString('fr-FR')}</p>
        <p>Affaire: ${order.projectCode || 'Sans affaire'}</p>
        <p>Statut: ${order.status === 'pending' ? 'En attente' : order.status === 'processed' ? 'En cours' : 'Terminée'}</p>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Référence</th>
              <th>Quantité</th>
              <th>Unité</th>
            </tr>
          </thead>
          <tbody>
    `;
      
    order.items.forEach(item => {
      htmlContent += `
        <tr>
          <td>${item.name}</td>
          <td>${item.reference}</td>
          <td>${item.quantity}</td>
          <td>${item.unit}</td>
        </tr>
      `;
    });
      
    htmlContent += `
        </tbody>
      </table>
    `;
      
    if (order.message) {
      htmlContent += `
        <p><strong>Message:</strong> ${order.message}</p>
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
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onClose} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour aux demandes
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(order.status)} text-white`}>
            {getStatusLabel(order.status)}
          </Badge>
          <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Exporter en CSV
          </Button>
          <Button variant="outline" onClick={printOrder} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Imprimer / PDF
          </Button>
          {order.status === 'completed' && !order.archived && (
            <Button 
              variant="outline" 
              onClick={handleArchiveOrder} 
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Archiver
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <CardTitle className="text-xl">
                Demande #{order.id} - {order.userName}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(order.date).toLocaleDateString('fr-FR')}
              </p>
              {order.projectCode && (
                <Badge variant="outline" className="mt-2">
                  Affaire: {order.projectCode} 
                  {getProjectName(order.projectCode) && ` - ${getProjectName(order.projectCode)}`}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-md font-semibold mb-2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-gray-500" /> Articles demandés
            </h3>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead>Terminé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pr-0">
                        <Checkbox 
                          id={`${item.id}-completed`}
                          checked={item.completed}
                          onCheckedChange={(checked) => handleItemCompletion(item.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <label 
                          htmlFor={`${item.id}-completed`}
                          className={`cursor-pointer ${item.completed ? 'line-through text-gray-500' : ''}`}
                        >
                          <div className="font-medium">{item.name}</div>
                          {item.category && <div className="text-xs text-gray-500">Catégorie: {item.category}</div>}
                        </label>
                      </TableCell>
                      <TableCell className="font-mono">{item.reference}</TableCell>
                      <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                      <TableCell>
                        {item.completed ? 
                          <span className="text-green-500 text-sm">Oui</span> : 
                          <span className="text-gray-400 text-sm">Non</span>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold mb-2 flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-gray-500" /> Message pour l'utilisateur
            </h3>
            <Textarea 
              placeholder="Ajoutez un message pour l'utilisateur (ex: Tu peux passer chercher ta commande quand tu veux)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center bg-gray-50 p-4 border-t">
          <div className="text-sm">
            <span className="font-semibold">
              {items.filter(i => i.completed).length} / {items.length}
            </span> articles traités
          </div>
          <Button onClick={saveChanges} className="flex items-center gap-1">
            <Save className="h-4 w-4" /> Enregistrer les modifications
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderManager;
