
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface OrderStatusSectionProps {
  status: string;
  isAdmin: boolean;
  onStatusChange: (status: string) => void;
}

const OrderStatusSection = ({
  status,
  isAdmin,
  onStatusChange
}: OrderStatusSectionProps) => {
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

  return <div>
      {isAdmin ? <div className="flex justify-between items-center border-t pt-4 mb-2">
          <p className="font-medium">Statut de la commande </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {formatStatus(status)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusChange('Non')}>
                En attente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('En cours')}>
                En cours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('Oui')}>
                Terminée
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> : <Badge className={`${getStatusBadgeClass(status)} text-white flex items-center gap-1`}>
          {getStatusIcon(status)}
          {formatStatus(status)}
        </Badge>}
    </div>;
};

export default OrderStatusSection;
