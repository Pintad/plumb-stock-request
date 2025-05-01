
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Product } from '@/types';

// Import refactored components
import CategorySidebar from '@/components/catalog/CategorySidebar';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import MobileCategoryBadge from '@/components/catalog/MobileCategoryBadge';
import ProductGrid from '@/components/catalog/ProductGrid';

const PRODUCTS_PER_PAGE = 24;

const Catalog = () => {
  const { products, cart, categories } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  
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
    // Retourner à la première page quand les filtres changent
    setCurrentPage(1);
  }, [searchTerm, products, selectedCategories, activeCategory]);

  // Paginer les résultats filtrés
  useEffect(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage]);

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
    // Retourner à la première page
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll vers le haut de la page pour une meilleure expérience utilisateur
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
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
          
          {/* Product grid with pagination */}
          <ProductGrid 
            products={paginatedProducts}
            resetFilters={resetFilters}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
};

export default Catalog;
