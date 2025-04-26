
import React from 'react';
import { Order, CartItem } from '@/types';
import { FileDown, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderDetailsPrintExportProps {
  order: Order;
  isMobile: boolean;
}

const OrderDetailsPrintExport = ({ order, isMobile }: OrderDetailsPrintExportProps) => {
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
    
    order.articles.forEach(article => {
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
    
    if (order.messagefournisseur) {
      htmlContent += `
        <p><strong>Message du magasinier:</strong> ${order.messagefournisseur}</p>
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
    <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} space-y-2 md:space-y-0 md:space-x-2 pt-4 border-t`}>
      <Button 
        variant="outline" 
        className="flex items-center justify-center gap-2 w-full md:w-auto"
        onClick={exportToCSV}
      >
        <FileDown className="h-4 w-4" />
        {isMobile ? 'CSV' : 'Exporter CSV'}
      </Button>
      
      <Button 
        variant="outline"
        className="flex items-center justify-center gap-2 w-full md:w-auto"
        onClick={printOrder}
      >
        <Printer className="h-4 w-4" />
        {isMobile ? 'Imprimer' : 'Imprimer la commande'}
      </Button>
    </div>
  );
};

export default OrderDetailsPrintExport;

