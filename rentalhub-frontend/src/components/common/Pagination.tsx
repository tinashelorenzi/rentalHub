// src/components/common/Pagination.tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;
  
  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    buttons.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? 'bg-primary text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        1
      </button>
    );
    
    // Calculate range of pages to show
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    if (endPage - startPage < maxVisiblePages - 3) {
      startPage = Math.max(2, endPage - (maxVisiblePages - 3) + 1);
    }
    
    // Add ellipsis if necessary
    if (startPage > 2) {
      buttons.push(
        <span key="ellipsis-start" className="px-3 py-1">
          ...
        </span>
      );
    }
    
    // Add pages in range
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipsis if necessary
    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="ellipsis-end" className="px-3 py-1">
          ...
        </span>
      );
    }
    
    // Always show last page if totalPages > 1
    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };
  
  return (
    <div className="flex items-center justify-center space-x-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        Previous
      </button>
      {renderPageButtons()}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;