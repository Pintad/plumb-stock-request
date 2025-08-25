
import { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Order } from '@/types';

// Define and export the interfaces needed for the dashboard data
export interface TopRequesterData {
  name: string;
  orderCount: number;
  itemCount: number;
  anticipatedOrders: number;
}

export interface OrderStatsData {
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalItems: number;
}

export interface TopItemData {
  name: string;
  count: number;
  quantity: number;
}

export interface OrderByDateData {
  date: string;
  displayDate: string;
  pending: number;
  inProgress: number;
  completed: number;
}

export const useDashboardData = (orders: Order[], products: any[]) => {
  // Préparation des données pour les statistiques
  const orderStats = useMemo(() => {
    // Nombre de demandes par statut
    const pendingOrders = orders.filter(order => order.termine === 'Non').length;
    const inProgressOrders = orders.filter(order => order.termine === 'En cours').length;
    const completedOrders = orders.filter(order => order.termine === 'Oui').length;
    
    // Nombre total d'articles demandés
    const totalItems = orders.reduce((sum, order) => 
      sum + order.articles.reduce((itemSum, article) => itemSum + article.quantity, 0), 0);
      
    return { pendingOrders, inProgressOrders, completedOrders, totalItems };
  }, [orders]);

  // Données pour les articles les plus commandés
  const topItemsData = useMemo(() => {
    // Comptabiliser tous les articles commandés
    const itemCounts = orders.reduce((acc, order) => {
      order.articles.forEach(article => {
        const itemKey = article.selectedVariantId 
          ? `${article.name}-${article.selectedVariantId}`
          : article.name;
        
        if (!acc[itemKey]) {
          acc[itemKey] = {
            name: article.name,
            variantName: article.selectedVariantId 
              ? article.variants?.find(v => v.id === article.selectedVariantId)?.variantName || ''
              : '',
            count: 0,
            quantity: 0
          };
        }
        
        acc[itemKey].count += 1;
        acc[itemKey].quantity += article.quantity;
      });
      return acc;
    }, {} as Record<string, { name: string; variantName: string, count: number, quantity: number }>);
    
    // Convertir en tableau et trier par nombre de commandes
    return Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10) // Top 10 des articles
      .map(item => ({
        name: item.variantName ? `${item.name} (${item.variantName})` : item.name,
        count: item.count,
        quantity: item.quantity
      }));
  }, [orders]);

  // Données pour le graphique des meilleurs demandeurs (ouvriers qui anticipent le plus)
  const topRequestersData = useMemo(() => {
    // Regrouper les commandes par ouvrier
    const requestsByWorker = orders.reduce((acc, order) => {
      const workerName = order.clientname || 'Inconnu';
      
      if (!acc[workerName]) {
        acc[workerName] = { 
          name: workerName,
          orderCount: 0,
          itemCount: 0,
          anticipatedOrders: 0 // Commandes avec date de mise à disposition
        };
      }
      
      acc[workerName].orderCount += 1;
      acc[workerName].itemCount += order.articles.length;
      
      // Si la commande a une date de mise à disposition, c'est une commande anticipée
      if (order.date_mise_a_disposition) {
        acc[workerName].anticipatedOrders += 1;
      }
      
      return acc;
    }, {} as Record<string, TopRequesterData>);
    
    // Convertir en tableau et trier par nombre de commandes
    return Object.values(requestsByWorker)
      .sort((a, b) => b.anticipatedOrders - a.anticipatedOrders || b.orderCount - a.orderCount)
      .slice(0, 5); // Top 5 des demandeurs
  }, [orders]) as TopRequesterData[];

  // Données des commandes par date pour voir les tendances
  const ordersByDateData = useMemo(() => {
    // Créer un dictionnaire des 14 derniers jours
    const last14Days = [...Array(14)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'dd MMM', { locale: fr }),
        pending: 0,
        inProgress: 0,
        completed: 0
      };
    });
    
    // Regrouper les commandes par date
    orders.forEach(order => {
      if (!order.datecommande) return;
      
      const orderDate = order.datecommande.split('T')[0];
      const dayData = last14Days.find(d => d.date === orderDate);
      
      if (dayData) {
        if (order.termine === 'Oui') {
          dayData.completed += 1;
        } else if (order.termine === 'En cours') {
          dayData.inProgress += 1;
        } else {
          dayData.pending += 1;
        }
      }
    });
    
    return last14Days;
  }, [orders]);

  // Configuration des couleurs pour les graphiques
  const chartConfig = {
    pending: { color: "#f97316", label: "En attente" },
    inProgress: { color: "#3b82f6", label: "En cours" },
    completed: { color: "#10b981", label: "Terminées" },
    items: { color: "#6E59A5", label: "Articles" },
  };

  return {
    orderStats,
    topItemsData,
    topRequestersData,
    ordersByDateData,
    chartConfig
  };
};
