
import React from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Calcul des pages à afficher (avec ellipsis si nécessaire)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Nombre maximum de pages à afficher

    if (totalPages <= maxPagesToShow) {
      // Si peu de pages, afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);

      // Calculer la plage de pages à afficher autour de la page actuelle
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Ajuster pour afficher jusqu'à 3 pages au milieu
      if (startPage > 2) pages.push(-1); // Ellipsis après la première page
      
      // Ajouter les pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Ajouter ellipsis avant la dernière page si nécessaire
      if (endPage < totalPages - 1) pages.push(-2); // Ellipsis avant la dernière page
      
      // Toujours afficher la dernière page
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage - 1);
              }} 
            />
          </PaginationItem>
        )}

        {getPageNumbers().map((pageNumber, index) => {
          // Si c'est une ellipsis, afficher ...
          if (pageNumber < 0) {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <span className="flex h-9 w-9 items-center justify-center">...</span>
              </PaginationItem>
            );
          }
          
          // C'est un numéro de page
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage + 1);
              }} 
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
