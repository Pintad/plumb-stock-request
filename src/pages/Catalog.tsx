
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { useProductFiltering } from '@/hooks/useProductFiltering';
import { useProductPagination } from '@/hooks/useProductPagination';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

// Import refactored components
import HierarchicalCategorySidebar from '@/components/catalog/HierarchicalCategorySidebar';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import MobileCategoryBadge from '@/components/catalog/MobileCategoryBadge';
import ProductGrid from '@/components/catalog/ProductGrid';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import ScannedProductForm from '@/components/scanner/ScannedProductForm';
import { Product } from '@/types';

const Catalog = () => {
  const { products, cart, categories } = useAppContext();
  const { searchProductByBarcode } = useBarcodeScanner();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  
  const {
    searchTerm,
    setSearchTerm,
    filteredProducts,
    activeCategory,
    activeSuperCategory,
    setCategory,
    setSuperCategory,
    resetFilters
  } = useProductFiltering({ products });

  const {
    currentPage,
    paginatedProducts,
    totalPages,
    handlePageChange
  } = useProductPagination({ filteredProducts });

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleScanSuccess = async (barcode: string) => {
    setShowScanner(false);
    const product = await searchProductByBarcode(barcode);
    if (product) {
      setScannedProduct(product);
    }
  };

  const handleScannerClose = () => {
    setShowScanner(false);
  };

  const handleProductFormClose = () => {
    setScannedProduct(null);
  };

  const handleAddToCart = () => {
    setScannedProduct(null);
  };

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
            onScannerOpen={() => setShowScanner(true)}
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
      
      {/* Scanner de code-barres */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={handleScannerClose}
        />
      )}
      
      {/* Formulaire d'article scanné */}
      {scannedProduct && (
        <ScannedProductForm
          product={scannedProduct}
          onClose={handleProductFormClose}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default Catalog;
