
import React, { useState } from 'react';
import { Package, Tag, Plus, Minus } from 'lucide-react';
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
  const [inputValue, setInputValue] = useState('1');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const { addToCart } = useAppContext();
  
  const handleAddToCart = () => {
    // Ensure quantity is at least 1 before adding to cart
    const finalQuantity = quantity < 1 ? 1 : quantity;
    
    if (selectedVariant) {
      // Produit avec variante sélectionnée
      const productWithVariant = {
        ...product,
        reference: selectedVariant.reference,
        unit: selectedVariant.unit,
        selectedVariantId: selectedVariant.id
      };
      addToCart(productWithVariant, finalQuantity);
    } else {
      // Produit simple sans variante
      addToCart(product, finalQuantity);
    }
    setQuantity(1);
    setInputValue('1');
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty field for user input flexibility
    if (value === '') {
      setInputValue('');
      setQuantity(0); // Temporarily set to 0
      return;
    }
    
    // Convert to number and validate
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setQuantity(numValue);
      setInputValue(value);
    }
  };

  // Handle blur event to prevent empty value when user leaves the field
  const handleBlur = () => {
    if (inputValue === '' || quantity < 1) {
      setQuantity(1);
      setInputValue('1');
    }
  };

  const incrementQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setInputValue(newQuantity.toString());
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
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
        <div className="flex items-center w-24">
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-r-none"
            onClick={decrementQuantity}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="text"
            value={inputValue}
            onChange={handleQuantityChange}
            onBlur={handleBlur}
            className="h-8 text-center rounded-none border-x-0"
            min="1"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-l-none"
            onClick={incrementQuantity}
          >
            <Plus className="h-3 w-3" />
          </Button>
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
