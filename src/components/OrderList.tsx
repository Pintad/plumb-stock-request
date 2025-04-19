
import React from 'react';
import { Order } from '@/types';
import { useAppContext } from '@/context/AppContext';
import EmptyOrderState from './orders/EmptyOrderState';
import OrderListItem from './orders/OrderListItem';

interface OrderListProps {
  orders: Order[];
  showUser?: boolean;
  showFullDetails?: boolean;
  onManageOrder?: (order: Order) => void;
  onArchiveOrder?: (orderId: string) => Promise<boolean>;
  isAdmin?: boolean;
}

const OrderList = ({ 
  orders, 
  showUser = false, 
  showFullDetails = false,
  onManageOrder,
  onArchiveOrder,
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
    <div className="space-y-4">
      {orders.length > 0 ? (
        orders.map((order) => (
          <OrderListItem
            key={order.commandeid}
            order={order}
            showUser={showUser}
            isAdmin={isAdmin}
            projectName={getProjectName(order.projectCode)}
            onManageOrder={onManageOrder}
            onExportCSV={exportToCSV}
            onPrintOrder={printOrder}
            onArchiveOrder={onArchiveOrder}
          />
        ))
      ) : (
        <EmptyOrderState />
      )}
    </div>
  );
};

export default OrderList;
