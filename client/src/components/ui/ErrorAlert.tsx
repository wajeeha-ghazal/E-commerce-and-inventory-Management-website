import React from 'react';
import { Alert, Button } from 'react-bootstrap';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onDismiss,
  onRetry,
  className = 'mb-4',
}) => {
  return (
    <Alert
      variant="danger"
      className={`d-flex align-items-center justify-content-between border-0 shadow-sm ${className}`}
      style={{ backgroundColor: '#fdf2f1', color: '#b24339' }}
      dismissible={!!onDismiss}
      onClose={onDismiss}
    >
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle-fill fs-5"></i>
        <span>{message}</span>
      </div>
      {onRetry && (
        <Button variant="outline-danger" size="sm" onClick={onRetry} className="ms-3">
          Retry
        </Button>
      )}
    </Alert>
  );
};

export default ErrorAlert;
