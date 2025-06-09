
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface AddToCartButtonProps {
  onAddToCart: () => void;
  disabled: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  onAddToCart, 
  disabled 
}) => {
  const isMobile = useIsMobile();

  return (
    <Button 
      onClick={onAddToCart}
      className={`${isMobile ? 'w-full py-6' : 'w-full sm:w-auto'} bg-plumbing-blue hover:bg-blue-600`}
      disabled={disabled}
    >
      Ajouter
    </Button>
  );
};

export default AddToCartButton;
