
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import { Product, ProductVariant } from '@/types';
import { useToast } from '@/hooks/use-toast';
import HighlightedText from '@/components/catalog/HighlightedText';

interface ProductCardProps {
  product: Product;
  searchTerms?: string[];
}

const ProductCard: React.FC<ProductCardProps> = ({ product, searchTerms = [] }) => {
  const { addToCart } = useAppContext();
  const { toast } = useToast();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.selectedVariantId || product.variants?.[0]?.id || ''
  );

  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      selectedVariantId: product.variants?.length ? selectedVariantId : undefined
    };

    addToCart(productToAdd);
    
    toast({
      title: "Produit ajouté",
      description: `${product.name} a été ajouté au panier`,
    });
  };

  const getDisplayReference = () => {
    if (product.variants?.length) {
      const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
      return selectedVariant?.reference || '';
    }
    return product.reference || '';
  };

  const getDisplayUnit = () => {
    if (product.variants?.length) {
      const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
      return selectedVariant?.unit || '';
    }
    return product.unit || '';
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Image section */}
      {product.imageUrl && (
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {product.superCategory && (
            <Badge variant="secondary" className="text-xs">
              <HighlightedText 
                text={product.superCategory} 
                searchTerms={searchTerms}
              />
            </Badge>
          )}
          {product.category && (
            <Badge variant="outline" className="text-xs">
              <HighlightedText 
                text={product.category} 
                searchTerms={searchTerms}
              />
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm font-medium leading-tight">
          <HighlightedText 
            text={product.name} 
            searchTerms={searchTerms}
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between p-4 pt-0">
        <div className="space-y-2 mb-4">
          {product.variants?.length ? (
            <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir une variante" />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map((variant: ProductVariant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.variantName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          
          <div className="text-xs text-gray-600 space-y-1">
            {getDisplayReference() && (
              <p><span className="font-medium">Réf:</span> <HighlightedText text={getDisplayReference()} searchTerms={searchTerms} /></p>
            )}
            {getDisplayUnit() && (
              <p><span className="font-medium">Unité:</span> {getDisplayUnit()}</p>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleAddToCart} 
          className="w-full bg-plumbing-blue hover:bg-blue-600"
          disabled={product.variants?.length > 0 && !selectedVariantId}
        >
          Ajouter au panier
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
