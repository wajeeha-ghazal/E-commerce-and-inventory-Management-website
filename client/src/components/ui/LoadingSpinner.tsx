import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  className = 'py-5 text-center',
}) => {
  return (
    <div className={className}>
      <Spinner animation="border" role="status" style={{ color: '#d97757' }}>
        <span className="visually-hidden">{message}</span>
      </Spinner>
      {message && <p className="mt-3 text-secondary small">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
