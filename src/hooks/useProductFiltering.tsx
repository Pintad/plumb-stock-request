
import { useState, useEffect } from 'react';
import { Product } from '@/types';

interface UseProductFilteringProps {
  products: Product[];
}

export const useProductFiltering = ({ products }: UseProductFilteringProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const [activeSuperCategory, setActiveSuperCategory] = useState<string | undefined>(undefined);

  // Filter products based on search and categories/super-categories
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    
    const filtered = products.filter(product => {
      // Enhanced search logic to include multiple fields
      let matchesSearch = true;
      
      if (term !== '') {
        // Search in designation (name)
        const matchesName = product.name.toLowerCase().includes(term);
        
        // Search in main product reference
        const productRef = product.reference?.toLowerCase() || '';
        const matchesProductReference = productRef.includes(term);
        
        // Search in variant references
        const matchesVariantReference = product.variants ? 
          product.variants.some(variant => 
            variant.reference?.toLowerCase().includes(term)
          ) : false;
        
        // Combine both types of reference search
        const matchesReference = matchesProductReference || matchesVariantReference;
        
        // Search in category
        const matchesCategory = product.category ? product.category.toLowerCase().includes(term) : false;
        
        // Search in super-category
        const matchesSuperCategory = product.superCategory ? product.superCategory.toLowerCase().includes(term) : false;
        
        // Search in keywords (nouvelle fonctionnalité)
        const matchesKeywords = product.keywords ? product.keywords.toLowerCase().includes(term) : false;
        
        // Multi-word search: split search term and check if all words are present
        const searchWords = term.split(/\s+/).filter(word => word.length > 0);
        
        // Build a string with all searchable fields
        const variantRefs = product.variants ? 
          product.variants.map(v => v.reference?.toLowerCase() || '').join(' ') : '';
        
        const allFields = [
          product.name.toLowerCase(),
          productRef,
          product.category?.toLowerCase() || '',
          product.superCategory?.toLowerCase() || '',
          product.keywords?.toLowerCase() || '', // Ajout des mots-clés dans la recherche globale
          variantRefs
        ].join(' ');
        
        const matchesMultiWord = searchWords.every(word => allFields.includes(word));
        
        // A product matches if it matches at least one of the criteria
        matchesSearch = matchesName || matchesReference || matchesCategory || matchesSuperCategory || matchesKeywords || matchesMultiWord;
      }
      
      // Filter by categories and super-categories
      let matchesCategory = true;
      
      if (activeSuperCategory && activeCategory === 'all') {
        // If a super-category is selected, show all products from this super-category
        matchesCategory = product.superCategory === activeSuperCategory;
      } else if (activeCategory !== 'all') {
        // If a specific category is selected
        if (activeSuperCategory) {
          // Check both super-category and category
          matchesCategory = product.superCategory === activeSuperCategory && product.category === activeCategory;
        } else {
          // Check only category
          matchesCategory = product.category === activeCategory;
        }
      }
      // If activeCategory === 'all' and no super-category, show everything
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, products, activeCategory, activeSuperCategory]);

  const setCategory = (category: string | 'all') => {
    setActiveCategory(category);
    // Clear search to show all products in the category
    setSearchTerm('');
  };

  const setSuperCategory = (superCategory: string | undefined) => {
    setActiveSuperCategory(superCategory);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setSuperCategory(undefined);
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredProducts,
    activeCategory,
    activeSuperCategory,
    setCategory,
    setSuperCategory,
    resetFilters
  };
};
