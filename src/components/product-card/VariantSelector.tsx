
import React from 'react';
import { ProductVariant } from '@/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface VariantSelectorProps {
  variants?: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantChange: (variantId: string) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({ 
  variants, 
  selectedVariant, 
  onVariantChange 
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="pt-1">
      <label className="text-xs text-gray-500 mb-1 block">Variante:</label>
      <Select 
        value={selectedVariant?.id} 
        onValueChange={onVariantChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir une variante" />
        </SelectTrigger>
        <SelectContent>
          {variants.map(variant => (
            <SelectItem key={variant.id} value={variant.id}>
              {variant.variantName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VariantSelector;
