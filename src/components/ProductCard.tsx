
import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

// Import refactored components
import ProductImage from '@/components/product-card/ProductImage';
import ProductInfo from '@/components/product-card/ProductInfo';
import VariantSelector from '@/components/product-card/VariantSelector';
import QuantitySelector from '@/components/product-card/QuantitySelector';
import AddToCartButton from '@/components/product-card/AddToCartButton';

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
  const isMobile = useIsMobile();
  
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
        <ProductImage 
          imageUrl={product.imageUrl} 
          name={product.name} 
        />
        
        <ProductInfo 
          name={product.name}
          reference={currentReference}
          unit={currentUnit}
          category={product.category}
        />
        
        <VariantSelector 
          variants={product.variants}
          selectedVariant={selectedVariant}
          onVariantChange={handleVariantChange}
        />
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <QuantitySelector 
          quantity={quantity}
          inputValue={inputValue}
          onQuantityChange={handleQuantityChange}
          onBlur={handleBlur}
          onIncrement={incrementQuantity}
          onDecrement={decrementQuantity}
        />
        
        <AddToCartButton 
          onAddToCart={handleAddToCart}
          disabled={product.variants && product.variants.length > 0 && !selectedVariant}
        />
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
