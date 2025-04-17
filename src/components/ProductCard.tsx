
import React, { useState } from 'react';
import { Package, Tag } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const { addToCart } = useAppContext();
  
  const handleAddToCart = () => {
    if (selectedVariant) {
      // Produit avec variante sélectionnée
      const productWithVariant = {
        ...product,
        reference: selectedVariant.reference,
        unit: selectedVariant.unit,
        selectedVariantId: selectedVariant.id
      };
      addToCart(productWithVariant, quantity);
    } else {
      // Produit simple sans variante
      addToCart(product, quantity);
    }
    setQuantity(1);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleVariantChange = (variantId: string) => {
    if (product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  };

  // Référence actuelle (de la variante sélectionnée ou du produit principal)
  const currentReference = selectedVariant ? selectedVariant.reference : product.reference;
  // Unité actuelle (de la variante sélectionnée ou du produit principal)
  const currentUnit = selectedVariant ? selectedVariant.unit : product.unit;

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
          
          {/* Sélection de la variante si applicable */}
          {product.variants && product.variants.length > 0 && (
            <div className="pt-1">
              <label className="text-xs text-gray-500 mb-1 block">Variante:</label>
              <Select 
                value={selectedVariant?.id} 
                onValueChange={handleVariantChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir une variante" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map(variant => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.variantName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {currentReference && <p className="text-sm text-gray-500">Réf: {currentReference}</p>}
          {currentUnit && <p className="text-xs text-gray-500">Unité: {currentUnit}</p>}
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
          disabled={product.variants && product.variants.length > 0 && !selectedVariant}
        >
          Ajouter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
