
import React, { useState } from 'react';
import { Package, Tag } from 'lucide-react';
import { Product } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useAppContext();
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="mb-4 bg-gray-50 rounded-md p-4 flex justify-center">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="h-32 object-contain"
            />
          ) : (
            <Package size={48} className="text-gray-400" />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-base">{product.name}</h3>
          <p className="text-sm text-gray-500">Réf: {product.reference}</p>
          <p className="text-xs text-gray-500">Unité: {product.unit}</p>
          {product.category && (
            <div className="flex items-center">
              <Tag className="w-3 h-3 text-gray-500 mr-1" />
              <Badge variant="outline" className="font-normal text-xs">
                {product.category}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <div className="w-24">
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="text-center"
          />
        </div>
        <Button 
          onClick={handleAddToCart}
          className="w-full sm:w-auto bg-plumbing-blue hover:bg-blue-600"
        >
          Ajouter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
