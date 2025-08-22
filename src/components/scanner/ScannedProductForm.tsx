import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface ScannedProductFormProps {
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
}

const ScannedProductForm: React.FC<ScannedProductFormProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState('1');
  const { addToCart } = useAppContext();
  const isMobile = useIsMobile();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setQuantity(numValue);
    }
  };

  const handleQuantityBlur = () => {
    if (quantity <= 0 || isNaN(quantity)) {
      setQuantity(1);
      setInputValue('1');
    } else {
      setInputValue(quantity.toString());
    }
  };

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setInputValue(newQuantity.toString());
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} ajouté au panier`);
    onAddToCart();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} bg-background`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Article scanné</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image du produit */}
          {product.imageUrl && (
            <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Informations produit */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">{product.reference}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Unité: {product.unit}
            </p>
          </div>

          {/* Sélecteur de quantité */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                id="quantity"
                type="text"
                value={inputValue}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                className="h-10 text-center flex-1"
                min="1"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={handleAddToCart} 
              className="w-full"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ajouter au panier
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Ignorer cet article
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScannedProductForm;