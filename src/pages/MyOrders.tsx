import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import OrderListItemCompact from '@/components/orders/OrderListItemCompact';
import { useAppContext } from '@/context/AppContext';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

const MyOrders = () => {
  const { orders, user, loadOrders, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);
  
  // Filter orders to show only those of the current user
  const userOrders = orders.filter(order => {
    if (order.clientname !== user?.name) return false;
    
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      return (
        (order.displayTitle || "").toLowerCase().includes(searchLower) ||
        (order.datecommande || "").toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
  
  // Orders are already sorted by numero_commande_global in the fetchOrders function
  // Apply pagination to the filtered orders
  const totalPages = Math.ceil(userOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = userOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (endPage - startPage < 4 && totalPages > 4) {
      if (currentPage < 3) {
        endPage = Math.min(totalPages, 5);
      } else {
        startPage = Math.max(1, totalPages - 4);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Mes demandes de stock
          </h1>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rechercher</label>
                <Input 
                  type="text" 
                  placeholder="Rechercher une commande..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {paginatedOrders.map(order => (
              <OrderListItemCompact
                key={order.commandeid}
                order={order}
                onClick={() => navigate(`/orders/${order.commandeid}`)}
              />
            ))}
            {paginatedOrders.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Aucune commande trouvée
              </p>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  );
};

export default MyOrders;
