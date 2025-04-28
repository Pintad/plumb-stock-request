
import React from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  resetFilters: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, resetFilters }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow">
        <p className="text-gray-500 mb-2">Aucun produit ne correspond à votre recherche</p>
        <Button variant="ghost" onClick={resetFilters}>
          Réinitialiser la recherche
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">{products.length} produits trouvés</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
};

export default ProductGrid;
