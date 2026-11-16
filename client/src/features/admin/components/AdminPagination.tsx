import React from 'react';
import { Pagination, Form } from 'react-bootstrap';

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50],
}) => {
  if (totalItems === 0) return null;

  const start = Math.min((currentPage - 1) * limit + 1, totalItems);
  const end = Math.min(currentPage * limit, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis-start');

      const rangeStart = Math.max(2, currentPage - 1);
      const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('ellipsis-end');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 p-3 bg-white border-top border-warm">
      <div className="d-flex align-items-center gap-3">
        <span className="small text-muted">
          Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{totalItems}</strong> entries
        </span>
        {onLimitChange && (
          <div className="d-flex align-items-center gap-1">
            <span className="small text-muted text-nowrap">Per page:</span>
            <Form.Select
              size="sm"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="border-warm py-0 px-2 small"
              style={{ width: '70px', height: '28px' }}
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Form.Select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination size="sm" className="mb-0">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          />

          {getPageNumbers().map((item, idx) => {
            if (typeof item === 'string') {
              return <Pagination.Ellipsis key={`ellipsis-${idx}`} disabled />;
            }
            return (
              <Pagination.Item
                key={item}
                active={item === currentPage}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Pagination.Item>
            );
          })}

          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          />
        </Pagination>
      )}
    </div>
  );
};

export default AdminPagination;
