
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Product } from '@/types';

// Import refactored components
import CategorySidebar from '@/components/catalog/CategorySidebar';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import MobileCategoryBadge from '@/components/catalog/MobileCategoryBadge';
import ProductGrid from '@/components/catalog/ProductGrid';

const Catalog = () => {
  const { products, cart, categories } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  
  // Filtrer les produits basés sur la recherche et les catégories
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    
    const filtered = products.filter(product => {
      // Filtre par terme de recherche
      const matchesSearch = term === '' ||
        product.name.toLowerCase().includes(term) ||
        (product.reference && product.reference.toLowerCase().includes(term));
      
      // Filtre par catégories sélectionnées
      const matchesCategory = activeCategory === 'all' || 
        (product.category && 
          (activeCategory === product.category || selectedCategories.includes(product.category)));
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategories, activeCategory]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const setCategory = (category: string | 'all') => {
    setActiveCategory(category);
    // Effacer la recherche pour montrer tous les produits de la catégorie
    setSearchTerm('');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategory('all');
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex flex-1 container px-4 py-6">
        {/* Sidebar for categories */}
        <CategorySidebar 
          categories={categories}
          products={products}
          activeCategory={activeCategory}
          setCategory={setCategory}
        />
        
        <div className="flex-1">
          <CatalogHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            cartItemsCount={cartItemsCount}
            products={products}
            categories={categories}
            activeCategory={activeCategory}
            setCategory={setCategory}
          />
          
          {/* Mobile category display */}
          <MobileCategoryBadge activeCategory={activeCategory} />
          
          {/* Product grid */}
          <ProductGrid 
            products={filteredProducts} 
            resetFilters={resetFilters} 
          />
        </div>
      </main>
    </div>
  );
};

export default Catalog;
