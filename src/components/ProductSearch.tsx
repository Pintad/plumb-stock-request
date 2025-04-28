
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Product, CartItem } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface ProductSearchProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  onProductSelected?: (product: CartItem) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ 
  searchTerm: externalSearchTerm, 
  setSearchTerm: externalSetSearchTerm,
  onProductSelected 
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const { products } = useAppContext();
  
  // Use either external or internal state
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = externalSetSearchTerm || setInternalSearchTerm;
  
  // Filter products based on search term if onProductSelected is provided
  const filteredProducts = onProductSelected ? 
    products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.reference && product.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];
    
  const handleSelectProduct = (product: Product) => {
    if (onProductSelected) {
      const cartItem: CartItem = {
        ...product,
        quantity: 1,
      };
      onProductSelected(cartItem);
      setSearchTerm('');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      
      {onProductSelected && searchTerm.length >= 2 && (
        <div className="mt-2 max-h-72 overflow-y-auto border rounded-md">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectProduct(product)}
              >
                <div className="font-medium">{product.name}</div>
                {product.reference && <div className="text-sm text-gray-500">Réf: {product.reference}</div>}
                {product.category && <div className="text-xs text-gray-400">{product.category}</div>}
              </div>
            ))
          ) : searchTerm.length >= 2 ? (
            <div className="p-3 text-center text-gray-500">Aucun produit trouvé</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
