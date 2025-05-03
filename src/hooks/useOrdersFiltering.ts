
import { useState, useMemo } from 'react';
import { Order } from '@/types';

interface UseOrdersFilteringProps {
  orders: Order[];
  itemsPerPage: number;
}

export const useOrdersFiltering = ({ orders, itemsPerPage }: UseOrdersFilteringProps) => {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  
  // Get unique users from orders
  const uniqueUsers = useMemo(() => {
    return [...new Set(orders.map(order => order.clientname))];
  }, [orders]);

  // Filter orders based on current filter settings
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filter by project
      if (selectedProject !== "all") {
        if (selectedProject === "none" && order.projectCode) return false;
        if (selectedProject !== "none" && order.projectCode !== selectedProject) return false;
      }
      
      // Filter by user
      if (selectedUser !== "all" && order.clientname !== selectedUser) {
        return false;
      }
      
      // Filter by search term (search in order ID, project code, client name)
      if (searchTerm.trim() !== "") {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.commandeid.toLowerCase().includes(searchLower) ||
          (order.projectCode || "").toLowerCase().includes(searchLower) ||
          (order.clientname || "").toLowerCase().includes(searchLower) ||
          (order.displayTitle || "").toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [orders, selectedProject, selectedUser, searchTerm]);
  
  // Paginate orders
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(
      (currentPage - 1) * itemsPerPage, 
      (currentPage - 1) * itemsPerPage + itemsPerPage
    );
  }, [filteredOrders, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedProject, selectedUser, searchTerm]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  return {
    selectedProject,
    setSelectedProject,
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    currentPage,
    uniqueUsers,
    filteredOrders,
    paginatedOrders,
    totalPages,
    handlePageChange
  };
};
