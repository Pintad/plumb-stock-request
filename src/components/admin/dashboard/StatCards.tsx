
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ListChecks, FileText, Package } from 'lucide-react';

interface StatCardsProps {
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalItems: number;
  isMobile?: boolean;
}

const StatCards = ({ 
  pendingOrders, 
  inProgressOrders, 
  completedOrders, 
  totalItems,
  isMobile = false
}: StatCardsProps) => {
  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
      <Link to="/admin/orders?status=pending" className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium`}>En attente</CardTitle>
            <Clock className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-amber-500`} />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-0 px-3 pb-3' : ''}>
            <p className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold`}>{pendingOrders}</p>
            <CardDescription className={isMobile ? 'text-xs' : ''}>Demandes à traiter</CardDescription>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/admin/orders?status=inProgress" className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium`}>En cours</CardTitle>
            <ListChecks className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-purple-500`} />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-0 px-3 pb-3' : ''}>
            <p className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold`}>{inProgressOrders}</p>
            <CardDescription className={isMobile ? 'text-xs' : ''}>Demandes en préparation</CardDescription>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/admin/orders?status=completed" className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium`}>Terminées</CardTitle>
            <FileText className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-green-500`} />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-0 px-3 pb-3' : ''}>
            <p className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold`}>{completedOrders}</p>
            <CardDescription className={isMobile ? 'text-xs' : ''}>Demandes complétées</CardDescription>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/admin/top-items" className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium`}>Articles</CardTitle>
            <Package className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-blue-500`} />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-0 px-3 pb-3' : ''}>
            <p className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold`}>{totalItems}</p>
            <CardDescription className={isMobile ? 'text-xs' : ''}>Produits les plus demandés</CardDescription>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default StatCards;
