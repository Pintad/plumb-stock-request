
import React from 'react';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductInfoProps {
  name: string;
  reference?: string;
  unit?: string;
  category?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ 
  name, 
  reference, 
  unit, 
  category 
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-base">{name}</h3>
      {reference && <p className="text-sm text-gray-500">Réf: {reference}</p>}
      {unit && <p className="text-xs text-gray-500">Unité: {unit}</p>}
      {category && (
        <div className="flex items-center">
          <Tag className="w-3 h-3 text-gray-500 mr-1" />
          <Badge variant="outline" className="font-normal text-xs">
            {category}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
