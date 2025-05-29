
import { useState, useEffect } from 'react';
import { Product } from '@/types';

const PRODUCTS_PER_PAGE = 24;

interface UseProductPaginationProps {
  filteredProducts: Product[];
}

export const useProductPagination = ({ filteredProducts }: UseProductPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);

  // Paginate filtered results
  useEffect(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top for better user experience
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  return {
    currentPage,
    paginatedProducts,
    totalPages,
    handlePageChange
  };
};
