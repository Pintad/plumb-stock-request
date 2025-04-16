
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import OrderList from '@/components/OrderList';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, FileDown, Printer, CheckCheck } from 'lucide-react';
import OrderManager from '@/components/OrderManager';
import { Order } from '@/types';

const AdminOrders = () => {
  const { orders, projects, updateOrderStatus } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Filter orders by project if a project is selected
  const filteredOrders = selectedProject === "all" 
    ? orders 
    : orders.filter(order => 
        selectedProject === "none" 
          ? !order.projectCode 
          : order.projectCode === selectedProject);

  const exportToCSV = () => {
    const header = ['ID', 'Utilisateur', 'Date', 'Affaire', 'Statut', 'Produit', 'Référence', 'Quantité', 'Unité'];
    let csvContent = header.join(',') + '\n';
    
    filteredOrders.forEach(order => {
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
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `commandes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printOrders = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let htmlContent = `
      <html>
      <head>
        <title>Demandes de Stock</title>
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
          <h1>Liste des demandes de stock</h1>
          <p class="date">Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
    `;
    
    filteredOrders.forEach(order => {
      htmlContent += `
        <h2>Demande #${order.id}</h2>
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
    });
    
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
        <h1 className="text-2xl font-bold mb-6">Gestion des demandes</h1>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full md:w-80">
                <label className="block text-sm font-medium mb-2">Filtrer par affaire</label>
                <Select 
                  value={selectedProject} 
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes les affaires" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les affaires</SelectItem>
                    <SelectItem value="none">Sans affaire</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.code}>
                        {project.code} - {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Exporter en CSV
                </Button>
                <Button variant="outline" onClick={printOrders} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimer / PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {selectedOrder ? (
          <OrderManager 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        ) : (
          <OrderList 
            orders={filteredOrders} 
            showUser={true} 
            showFullDetails={true} 
            onManageOrder={setSelectedOrder}
            isAdmin={true}
          />
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
