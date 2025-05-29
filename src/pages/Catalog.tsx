import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Product } from '@/types';

// Import refactored components
import HierarchicalCategorySidebar from '@/components/catalog/HierarchicalCategorySidebar';
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
  const [activeSuperCategory, setActiveSuperCategory] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  
  // Filtrer les produits basés sur la recherche et les catégories/sur-catégories
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    
    const filtered = products.filter(product => {
      // Amélioration de la logique de recherche pour inclure plusieurs champs
      let matchesSearch = true;
      
      if (term !== '') {
        // Recherche dans la désignation (nom)
        const matchesName = product.name.toLowerCase().includes(term);
        
        // Recherche dans la référence du produit principal
        const productRef = product.reference?.toLowerCase() || '';
        const matchesProductReference = productRef.includes(term);
        
        // Recherche dans les références des variantes
        const matchesVariantReference = product.variants ? 
          product.variants.some(variant => 
            variant.reference?.toLowerCase().includes(term)
          ) : false;
        
        // Combiner les deux types de recherche de référence
        const matchesReference = matchesProductReference || matchesVariantReference;
        
        // Recherche dans la catégorie
        const matchesCategory = product.category ? product.category.toLowerCase().includes(term) : false;
        
        // Recherche dans la sur-catégorie
        const matchesSuperCategory = product.superCategory ? product.superCategory.toLowerCase().includes(term) : false;
        
        // Recherche multi-mots : diviser le terme de recherche et vérifier si tous les mots sont présents
        const searchWords = term.split(/\s+/).filter(word => word.length > 0);
        
        // Construire une chaîne avec tous les champs cherchables
        const variantRefs = product.variants ? 
          product.variants.map(v => v.reference?.toLowerCase() || '').join(' ') : '';
        
        const allFields = [
          product.name.toLowerCase(),
          productRef,
          product.category?.toLowerCase() || '',
          product.superCategory?.toLowerCase() || '',
          variantRefs
        ].join(' ');
        
        const matchesMultiWord = searchWords.every(word => allFields.includes(word));
        
        // Un produit correspond s'il match au moins un des critères
        matchesSearch = matchesName || matchesReference || matchesCategory || matchesSuperCategory || matchesMultiWord;
        
        if (matchesSearch) {
          console.log('Produit trouvé:', product.name, 'pour le terme:', term);
        }
      }
      
      // Filtre par catégories et sur-catégories
      let matchesCategory = true;
      
      if (activeSuperCategory && activeCategory === 'all') {
        // Si une sur-catégorie est sélectionnée, montrer tous les produits de cette sur-catégorie
        matchesCategory = product.superCategory === activeSuperCategory;
      } else if (activeCategory !== 'all') {
        // Si une catégorie spécifique est sélectionnée
        if (activeSuperCategory) {
          // Vérifier à la fois la sur-catégorie et la catégorie
          matchesCategory = product.superCategory === activeSuperCategory && product.category === activeCategory;
        } else {
          // Vérifier seulement la catégorie
          matchesCategory = product.category === activeCategory;
        }
      }
      // Si activeCategory === 'all' et pas de sur-catégorie, on montre tout
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredProducts(filtered);
    // Retourner à la première page quand les filtres changent
    setCurrentPage(1);
  }, [searchTerm, products, selectedCategories, activeCategory, activeSuperCategory]);

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

  const setSuperCategory = (superCategory: string | undefined) => {
    setActiveSuperCategory(superCategory);
    // Retourner à la première page
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setSuperCategory(undefined);
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
        <HierarchicalCategorySidebar 
          products={products}
          activeCategory={activeCategory}
          activeSuperCategory={activeSuperCategory}
          setCategory={setCategory}
          setSuperCategory={setSuperCategory}
        />
        
        <div className="flex-1">
          <CatalogHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            cartItemsCount={cartItemsCount}
            products={products}
            categories={categories}
            activeCategory={activeCategory}
            activeSuperCategory={activeSuperCategory}
            setCategory={setCategory}
            setSuperCategory={setSuperCategory}
          />
          
          {/* Mobile category display */}
          <MobileCategoryBadge 
            activeCategory={activeCategory} 
            activeSuperCategory={activeSuperCategory}
          />
          
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
