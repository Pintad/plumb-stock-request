
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductSearch from '@/components/ProductSearch';
import HierarchicalMobileCategoryFilter from './HierarchicalMobileCategoryFilter';
import { useAppContext } from '@/context/AppContext';

interface CatalogHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  cartItemsCount: number;
  products: any[];
  categories: string[];
  activeCategory: string | 'all';
  activeSuperCategory?: string;
  setCategory: (category: string | 'all') => void;
  setSuperCategory?: (superCategory: string | undefined) => void;
  onScannerOpen?: () => void;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  searchTerm, 
  setSearchTerm, 
  cartItemsCount, 
  products,
  categories,
  activeCategory,
  activeSuperCategory,
  setCategory,
  setSuperCategory,
  onScannerOpen
}) => {
  const { user } = useAppContext();
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex-1 max-w-md">
        <ProductSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
      
      <div className="flex items-center gap-2">
        <HierarchicalMobileCategoryFilter
          products={products}
          activeCategory={activeCategory}
          activeSuperCategory={activeSuperCategory}
          setCategory={setCategory}
          setSuperCategory={setSuperCategory}
        />
        
        {/* Bouton Scanner pour les magasiniers */}
        {user?.role === 'admin' && onScannerOpen && (
          <Button 
            variant="outline" 
            onClick={onScannerOpen}
            className="flex items-center gap-2"
          >
            <Scan className="h-4 w-4" />
            Scanner
          </Button>
        )}
        
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
