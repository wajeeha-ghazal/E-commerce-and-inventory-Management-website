import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { useAppSelector } from '../../app/hooks';

export const AdminDashboardPlaceholder: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="py-2">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="serif-display text-dark mb-1">Store Administration</h1>
          <p className="text-secondary small mb-0">Welcome to the store manager dashboard.</p>
        </div>
        <Badge bg="dark" className="px-3 py-2 text-white">
          <i className="bi bi-shield-check me-1"></i> Admin Access Confirmed
        </Badge>
      </div>

      <Card className="border-warm warm-shadow p-4 bg-white mb-4">
        <h5 className="serif-display mb-2">RBAC Verification Active</h5>
        <p className="text-secondary small mb-3">
          You are authenticated as <strong>{user?.email}</strong> with role{' '}
          <span className="badge bg-terracotta">{user?.role}</span>. Customer accounts are
          automatically blocked by the <code>&lt;AdminRoute /&gt;</code> guard and the server's{' '}
          <code>authorizeRoles('admin')</code> middleware.
        </p>
        <hr className="border-warm" />
        <Row className="g-3">
          <Col md={4}>
            <div className="p-3 bg-cream rounded border border-warm">
              <h6 className="fw-semibold mb-1">Products CRUD</h6>
              <small className="text-muted">Coming in Slice 5</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-cream rounded border border-warm">
              <h6 className="fw-semibold mb-1">Category Management</h6>
              <small className="text-muted">Coming in Slice 5</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-cream rounded border border-warm">
              <h6 className="fw-semibold mb-1">Order Status Updates</h6>
              <small className="text-muted">Coming in Slice 5</small>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboardPlaceholder;
