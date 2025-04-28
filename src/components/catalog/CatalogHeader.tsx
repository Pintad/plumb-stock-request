
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductSearch from '@/components/ProductSearch';
import MobileCategoryFilter from './MobileCategoryFilter';

interface CatalogHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  cartItemsCount: number;
  products: any[];
  categories: string[];
  activeCategory: string | 'all';
  setCategory: (category: string | 'all') => void;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  searchTerm, 
  setSearchTerm, 
  cartItemsCount, 
  products,
  categories,
  activeCategory,
  setCategory
}) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex-1 max-w-md">
        <ProductSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
      
      <div className="flex items-center gap-2">
        <MobileCategoryFilter
          categories={categories}
          products={products}
          activeCategory={activeCategory}
          setCategory={setCategory}
        />
        
        {cartItemsCount > 0 && (
          <Link to="/cart">
            <Button className="bg-plumbing-blue hover:bg-blue-600 flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Panier ({cartItemsCount})
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default CatalogHeader;
