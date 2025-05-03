
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { useOrdersFiltering } from '@/hooks/useOrdersFiltering';
import OrderFilters from '@/components/admin/orders/OrderFilters';
import OrdersList from '@/components/admin/orders/OrdersList';
import OrdersPagination from '@/components/admin/orders/OrdersPagination';

const ITEMS_PER_PAGE = 10;

const AdminOrders = () => {
  const { orders, projects, loadOrders, isLoading } = useAppContext();
  const navigate = useNavigate();
  
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
      
      <main className="flex-1 container px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Gestion des demandes
          </h1>
        </div>
        
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
