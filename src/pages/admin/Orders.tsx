
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { useOrdersFiltering } from '@/hooks/useOrdersFiltering';
import OrderFilters from '@/components/admin/orders/OrderFilters';
import OrdersList from '@/components/admin/orders/OrdersList';
import OrdersPagination from '@/components/admin/orders/OrdersPagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@/components/ui/drawer';

const ITEMS_PER_PAGE = 10;

const AdminOrders = () => {
  const { orders, projects, loadOrders, isLoading } = useAppContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const {
    selectedProject,
    setSelectedProject,
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    currentPage,
    uniqueUsers,
    paginatedOrders,
    totalPages,
    handlePageChange
  } = useOrdersFiltering({ orders, itemsPerPage: ITEMS_PER_PAGE });
  
  // Load orders when the component mounts
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleOrderClick = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className={`flex-1 container ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'mb-3' : 'mb-6'}`}>
          <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
            Gestion des demandes
          </h1>
          
          {isMobile && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  Filtres
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-4">
                <DrawerHeader>
                  <DrawerTitle>Filtrer les demandes</DrawerTitle>
                </DrawerHeader>
                <div className="pb-4">
                  <OrderFilters 
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    projects={projects}
                    uniqueUsers={uniqueUsers}
                  />
                </div>
                <DrawerFooter>
                  <Button variant="outline" size="sm" onClick={() => {}} className="w-full">
                    Fermer
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </div>
        
        {!isMobile && (
          <OrderFilters 
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            projects={projects}
            uniqueUsers={uniqueUsers}
          />
        )}
        
        <OrdersList 
          orders={paginatedOrders}
          isLoading={isLoading}
          onOrderClick={handleOrderClick}
        />
        
        <OrdersPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
};

export default AdminOrders;
