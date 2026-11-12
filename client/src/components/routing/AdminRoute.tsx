import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import { useAppSelector } from '../../app/hooks';
import LoadingSpinner from '../ui/LoadingSpinner';

export const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) {
    return <LoadingSpinner message="Verifying permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <Container className="py-5">
        <Card
          className="mx-auto border-warm warm-shadow text-center p-5"
          style={{ maxWidth: '520px' }}
        >
          <div className="mb-3">
            <span className="display-4 text-danger">🛡️</span>
          </div>
          <h2 className="serif-display text-danger mb-2">403 Forbidden</h2>
          <p className="text-secondary mb-4">
            You do not have administrative privileges to access this area. Only accounts with the{' '}
            <strong>admin</strong> role can manage products, categories, and store orders.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/" className="btn btn-terracotta">
              Return to Catalog
            </Link>
            <Link to="/profile" className="btn btn-outline-secondary">
              View Profile
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
