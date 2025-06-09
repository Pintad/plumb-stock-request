
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuantitySelectorProps {
  quantity: number;
  inputValue: string;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  inputValue,
  onQuantityChange,
  onBlur,
  onIncrement,
  onDecrement
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex items-center ${isMobile ? 'w-full' : 'w-24'}`}>
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} rounded-r-none`}
        onClick={onDecrement}
        aria-label="Diminuer la quantité"
      >
        <Minus className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
      </Button>
      <Input
        type="text"
        value={inputValue}
        onChange={onQuantityChange}
        onBlur={onBlur}
        className={`${isMobile ? 'h-10' : 'h-8'} text-center rounded-none border-x-0`}
        min="1"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Quantité"
      />
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} rounded-l-none`}
        onClick={onIncrement}
        aria-label="Augmenter la quantité"
      >
        <Plus className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
      </Button>
    </div>
  );
};

export default QuantitySelector;
