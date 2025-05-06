
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ListChecks, FileText, Package } from 'lucide-react';

interface StatCardsProps {
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalItems: number;
}

const StatCards = ({ 
  pendingOrders, 
  inProgressOrders, 
  completedOrders, 
  totalItems 
}: StatCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Link to="/admin/orders?status=pending" className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">En attente</CardTitle>
            <Clock className="h-6 w-6 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingOrders}</p>
            <CardDescription>Demandes à traiter</CardDescription>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/admin/orders?status=inProgress" className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">En cours</CardTitle>
            <ListChecks className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inProgressOrders}</p>
            <CardDescription>Demandes en préparation</CardDescription>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/admin/orders?status=completed" className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Terminées</CardTitle>
            <FileText className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedOrders}</p>
            <CardDescription>Demandes complétées</CardDescription>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/admin/top-items" className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Articles</CardTitle>
            <Package className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalItems}</p>
            <CardDescription>Produits les plus demandés</CardDescription>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default StatCards;
