import React from 'react';
import { Badge } from 'react-bootstrap';

interface StockBadgeProps {
  stock: number;
  className?: string;
}

const StockBadge: React.FC<StockBadgeProps> = ({ stock, className = '' }) => {
  if (stock === 0) {
    return (
      <Badge bg="danger" className={`px-2 py-1 ${className}`}>
        Out of Stock
      </Badge>
    );
  }
  if (stock <= 5) {
    return (
      <Badge bg="warning" text="dark" className={`px-2 py-1 ${className}`}>
        Only {stock} left
      </Badge>
    );
  }
  return (
    <Badge bg="success" className={`px-2 py-1 ${className}`}>
      In Stock
    </Badge>
  );
};

export default StockBadge;
