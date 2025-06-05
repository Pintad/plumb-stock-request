
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CustomCartItem } from '@/hooks/useCustomCartItems';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomItemsListProps {
  customItems: CustomCartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CustomItemsList: React.FC<CustomItemsListProps> = ({
  customItems,
  onUpdateQuantity,
  onRemove
}) => {
  const isMobile = useIsMobile();

  if (customItems.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700">
          Articles personnalisés ({customItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {customItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 bg-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-3">
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    Article personnalisé
                  </div>
                  <div className="text-sm text-gray-600 break-words">
                    {item.text}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border rounded-md bg-white">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-r-none"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-medium w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-l-none"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    aria-label="Supprimer l'article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomItemsList;
